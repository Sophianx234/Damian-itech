"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon, User, Package, Heart, LogOut, Search, X, Menu } from "lucide-react";
import styles from "./Header.module.css";
import { useCart } from "../../context/CartContext";

const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ fullName: string } | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { cartCount } = useCart();
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [headerProducts, setHeaderProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isSearchOpen && headerProducts.length === 0) {
      setIsSearching(true);
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          if (data.success) setHeaderProducts(data.data);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }
  }, [isSearchOpen, headerProducts.length]);

  const liveSearchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return headerProducts.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.brand?.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [searchQuery, headerProducts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to fetch session", err));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIsUserMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: "Shop", href: "/" },
    { name: "New Arrivals", href: "/new-arrivals" },
    { name: "Best Sellers", href: "/best-sellers" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <button 
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link href="/" className={styles.logo}>
          <Image
            src="/imgs/logo-1.png"
            alt="Damian iTech Logo"
            width={160}
            height={48}
            className={`${styles.logoIcon} ${styles.logoLight}`}
            style={{ objectFit: "contain", width: "auto", height: "40px" }}
            priority
          />
          <Image
            src="/imgs/logo-3.png"
            alt="Damian iTech Logo Dark"
            width={160}
            height={48}
            className={`${styles.logoIcon} ${styles.logoDark}`}
            style={{ objectFit: "contain", width: "auto", height: "40px" }}
            priority
          />
        </Link>

        <nav className={styles.nav}>
          {navLinks.map((link) => {
            let isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/');
            if (link.name === "Shop" && (pathname?.startsWith('/product/') || pathname?.startsWith('/products/'))) {
              isActive = true;
            }
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className={styles.icons}>
          <button
            aria-label="Toggle Theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={styles.themeToggle}
          >
            {mounted && (
              <>
                <Sun className={`${styles.icon} ${styles.sun}`} size={20} />
                <Moon className={`${styles.icon} ${styles.moon}`} size={20} />
              </>
            )}
          </button>
          <button aria-label="Search" onClick={() => setIsSearchOpen(true)}>
            <Search size={20} />
          </button>

          <div className={styles.userMenuContainer} ref={menuRef}>
            <button
              aria-label="User Account"
              className={styles.userBtn}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user && (
                <span className={styles.userGreeting}>
                  Hi, {user.fullName.split(" ")[0]}
                </span>
              )}
            </button>



            {isUserMenuOpen && (
              <div className={styles.userDropdown}>
                {user ? (
                  <>
                    <Link href="/account" className={styles.dropdownItem}>
                      <User size={16} /> My Account
                    </Link>
                    <Link href="/orders" className={styles.dropdownItem}>
                      <Package size={16} /> Orders
                    </Link>
                    <Link href="/wishlist" className={styles.dropdownItem}>
                      <Heart size={16} /> Wishlist
                    </Link>
                    <Link
                      href=""
                      onClick={handleLogout}
                      className={styles.dropdownItemx}
                    >
                      {" "}
                      Logout
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={styles.dropdownItemx}>
                      {" "}
                      Log In
                    </Link>
                    <>
                      <Link href="/login" className={styles.dropdownItem}>
                        <User size={16} /> My Account
                      </Link>
                      <Link href="/login" className={styles.dropdownItem}>
                        <Package size={16} /> Orders
                      </Link>
                      <Link href="/login" className={styles.dropdownItem}>
                        <Heart size={16} /> Wishlist
                      </Link>
                    </>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          {cartCount > 0 && (
            <span className={styles.cartBadge}>{cartCount}</span>
          )}
          </Link>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {isMobileMenuOpen && (
        <div className={styles.mobileNav}>
          {navLinks.map((link) => {
            let isActive = pathname === link.href || (pathname?.startsWith(link.href) && link.href !== '/');
            if (link.name === "Shop" && (pathname?.startsWith('/product/') || pathname?.startsWith('/products/'))) {
              isActive = true;
            }
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`${styles.mobileNavLink} ${isActive ? styles.activeMobileNavLink : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            );
          })}
          
          <div className={styles.mobileNavDivider}></div>
          
          {user ? (
            <>
              <Link href="/account" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <User size={18} className={styles.mobileNavIcon} /> My Account
              </Link>
              <Link href="/orders" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Package size={18} className={styles.mobileNavIcon} /> Orders
              </Link>
              <Link href="/wishlist" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
                <Heart size={18} className={styles.mobileNavIcon} /> Wishlist
              </Link>
              <button 
                className={styles.mobileNavLinkBtn} 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              >
                <LogOut size={18} className={styles.mobileNavIcon} /> Logout
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>
              <User size={18} className={styles.mobileNavIcon} /> Log In / Register
            </Link>
          )}

          <div className={styles.mobileNavDivider}></div>

          <button
            className={styles.mobileNavLinkBtn}
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              setIsMobileMenuOpen(false);
            }}
          >
            {mounted && theme === "dark" ? (
              <><Sun size={18} className={styles.mobileNavIcon} /> Light Mode</>
            ) : (
              <><Moon size={18} className={styles.mobileNavIcon} /> Dark Mode</>
            )}
          </button>
        </div>
      )}

      {/* Full Screen Search Overlay */}
      {isSearchOpen && (
        <div className={styles.searchOverlay}>
          <div className={styles.searchOverlayContent}>
            <button className={styles.closeSearchBtn} onClick={() => setIsSearchOpen(false)}>
              <X size={32} />
            </button>
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <Search size={28} className={styles.searchFormIcon} />
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchOverlayInput}
                autoFocus
              />
              <button type="submit" className={styles.searchSubmitBtn}>Search</button>
            </form>

            {searchQuery.trim() !== "" && (
              <div className={styles.liveResultsContainer}>
                {isSearching ? (
                  <div className={styles.liveResultsList}>
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={styles.liveResultSkeleton}>
                        <div className={styles.skeletonImageSmall}></div>
                        <div className={styles.skeletonTextSmall}></div>
                      </div>
                    ))}
                  </div>
                ) : liveSearchResults.length > 0 ? (
                  <div className={styles.liveResultsList}>
                    {liveSearchResults.map(product => (
                      <Link 
                        key={product._id} 
                        href={`/products/${product.slug || product.title?.toLowerCase().replace(/\s+/g, '-')}`} 
                        className={styles.liveResultItem}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <Image 
                          src={product.images?.[0] || "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=200&auto=format&fit=crop"} 
                          alt={product.title} 
                          width={48} 
                          height={48} 
                          className={styles.liveResultImage} 
                        />
                        <div className={styles.liveResultInfo}>
                          <p className={styles.liveResultTitle}>{product.title}</p>
                          <p className={styles.liveResultPrice}>${product.price?.toFixed(2)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noResultsText}>No products found.</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
