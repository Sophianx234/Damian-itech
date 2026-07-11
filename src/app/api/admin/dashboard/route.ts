import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";

export async function GET() {
  try {
    await dbConnect();

    // 1. Top Level KPIs
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const salesResult = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = salesResult[0]?.totalSales || 0;

    // 2. Sales Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
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

    // Format sales data for Recharts
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const salesData = rawSalesData.map(d => {
      const date = new Date(d._id);
      return {
        name: days[date.getDay()],
        total: d.total,
        fullDate: d._id
      };
    });

    // 3. Products by Category (instead of mockup views)
    const categoryData = await Product.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { name: "$_id", views: "$count", _id: 0 } },
      { $sort: { views: -1 } }
    ]);

    // 4. Top Sold Items
    const topSoldItemsRaw = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { orderStatus: { $ne: "cancelled" } } },
      {
        $group: {
          _id: "$items.name",
          sales: { $sum: "$items.quantity" },
        },
      },
      { $sort: { sales: -1 } },
      { $limit: 5 },
    ]);

    const maxSales = Math.max(...topSoldItemsRaw.map(item => item.sales), 1);
    const topSoldItems = topSoldItemsRaw.map(item => ({
      name: item._id,
      sales: item.sales,
      percentage: Math.round((item.sales / maxSales) * 100)
    }));

    // 5. Recent Orders
    const recentOrdersRaw = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "fullName")
      .lean();

    const recentOrders = recentOrdersRaw.map((o: any) => ({
      id: o._id.toString().substring(0, 8).toUpperCase(),
      product: o.items.map((i: any) => i.name).join(", "),
      customer: o.user ? o.user.fullName : (o.shippingDetails?.fullName || "Guest"),
      date: new Date(o.createdAt).toISOString().split("T")[0],
      price: `$${o.totalAmount.toLocaleString()}`,
      status: o.orderStatus.charAt(0).toUpperCase() + o.orderStatus.slice(1)
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalCustomers,
        totalProducts,
        totalOrders,
        totalSales,
        salesData,
        categoryData,
        topSoldItems,
        recentOrders,
      }
    });
  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
