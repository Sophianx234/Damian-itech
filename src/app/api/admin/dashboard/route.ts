import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET() {
  try {
    await dbConnect();

    // 1. Top Level KPIs
    // Total Revenue
    const salesResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = salesResult[0]?.totalSales || 0;

    // Active Inventory (Combined Store & Used)
    const activeInventory = await Product.countDocuments({ status: "Active" });

    // Orders Count
    const totalOrdersCount = await Order.countDocuments();
    const pendingOrdersCount = await Order.countDocuments({ orderStatus: "pending" });

    // AOV
    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Active Swap Proposals
    const activeSwapProposals = await Product.countDocuments({ isSwappable: true, status: "Active" });

    // 2. Revenue Overview (Bar Chart - Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0,0,0,0);
    
    const rawSalesData = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days
    const salesData = [];
    for(let i=0; i<7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const found = rawSalesData.find(x => x._id === dateStr);
      salesData.push({
        name: d.toLocaleDateString("en-US", { weekday: 'short' }),
        total: found ? found.total : 0,
      });
    }

    // 3. Inventory Breakdown (Store vs Used)
    const inventoryBreakdown = await Product.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$productType", count: { $sum: 1 } } },
      { $project: { name: "$_id", value: "$count", _id: 0 } }
    ]);
    // Ensure both exist
    const hasStore = inventoryBreakdown.find(i => i.name === 'Store');
    const hasUsed = inventoryBreakdown.find(i => i.name === 'Used');
    if(!hasStore) inventoryBreakdown.push({name: 'Store', value: 0});
    if(!hasUsed) inventoryBreakdown.push({name: 'Used', value: 0});

    // 4. Recent Orders
    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "fullName")
      .lean();

    const recentOrders = recentOrdersRaw.map((o: any) => ({
      id: o._id.toString(),
      customer: o.user ? o.user.fullName : (o.shippingDetails?.fullName || "Guest"),
      product: o.items.map((i: any) => i.name).join(", "),
      date: new Date(o.createdAt).toISOString().split("T")[0],
      type: o.paymentMethod === 'pickup' ? 'Pickup' : 'Delivery',
      status: o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1)
    }));

    // 5. Pending Swap Offers & Reservations
    // We will just fetch products that are reserved or swappable.
    const swapOffersRaw = await Product.find({ isSwappable: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
      
    const swapOffers = swapOffersRaw.map((p: any) => ({
      id: p._id.toString(),
      user: "Anonymous User", // Mocked as Product doesn't store user unless we have a specific swap offer model
      targetProduct: p.title,
      offeredDevice: p.lookingFor || "Cash + Trade-in"
    }));

    // 6. Low Stock Alerts
    const lowStockRaw = await Product.find({ stock: { $lte: 5 }, status: "Active" })
      .sort({ stock: 1 })
      .limit(6)
      .lean();
    
    const lowStockAlerts = lowStockRaw.map((p: any) => ({
      id: p._id.toString(),
      product: p.title,
      stock: p.stock
    }));

    // 7. Top Customers
    const topCustomersRaw = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { 
        $group: { 
          _id: "$shippingDetails.email", 
          name: { $first: "$shippingDetails.fullName" },
          totalSpent: { $sum: "$totalAmount" },
          ordersCount: { $sum: 1 }
        } 
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 6 }
    ]);
    
    const topCustomers = topCustomersRaw.map(c => ({
      email: c._id || "Guest",
      name: c.name || "Guest Customer",
      spent: `$${c.totalSpent.toLocaleString()}`,
      orders: c.ordersCount
    }));

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          totalOrdersCount,
          averageOrderValue,
          activeInventory,
          pendingOrdersCount,
          activeSwapProposals
        },
        salesData,
        inventoryBreakdown,
        recentOrders,
        swapOffers,
        lowStockAlerts,
        topCustomers
      }
    });
  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
