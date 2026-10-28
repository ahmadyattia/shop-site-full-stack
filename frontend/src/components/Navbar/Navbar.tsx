import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "@/styles/Navbar/Navbar.module.css";
import NavbarCart from "@/components/Cart/NavbarCart";
import NavbarSettings from "./NavbarSettings";
import useMediaQuery from "@/hooks/useMediaQuery";
import NavbarBtn from "./NavbarBtn";
import { useAuth } from "@/context/AuthContext";

// icons
import closeMenuIcon from "@/assets/images/icons/close-icon-white.svg";
import hamburgerMenuIcon from "@/assets/images/icons/menu_16px-white.svg";
import rightArrow from "@/assets/images/icons/right_angle_bracket_white_16px.svg";
import loginIcon from "@/assets/images/icons/login_black.svg";
import orderIcon from "@/assets/images/icons/order-icon.svg";
import homeIcon from "@/assets/images/icons/home-icon-black.svg";
import aboutIcon from "@/assets/images/icons/about-icon-black.svg";
import shopIcon from "@/assets/images/icons/shop-icon-black.svg";
import loginIconWhite from "@/assets/images/icons/login_white.svg";
import orderIconWhite from "@/assets/images/icons/order-icon-white.svg";
import logoutIconWhite from "@/assets/images/icons/logout_white.svg";
import homeIconWhite from "@/assets/images/icons/home-icon-white.svg";
import aboutIconWhite from "@/assets/images/icons/about-icon-white.svg";
import shopIconWhite from "@/assets/images/icons/shop-icon-white.svg";
import deleteAccIconWhite from "@/assets/images/icons/delete-icon-white.svg";
import useClickOutside from "@/hooks/useClickOutside";

const Navbar = () => {
  const isMobile = useMediaQuery("(max-width: 850px)");
  const isDesktop = !isMobile;
  const [isActive, setIsActive] = useState(false);
  const { user, logout, deleteAccount } = useAuth();
  const mobileMenuRef = useRef(null);

  useClickOutside(setIsActive, mobileMenuRef);

  function handleMenuClick() {
    if (isActive) {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  }

  return (
    <nav>
      <div id={styles.navbar}>
        {isMobile && (
          <div
            ref={mobileMenuRef}
            className={styles.mainNavMenuMobile}
            onClick={handleMenuClick}
          >
            <div
              className={
                isActive ? styles.mainNavLstOpened : styles.mainNavLstClosed
              }
            >
              <div className={styles.closeMenuIconBox}>
                <img
                  className={styles.closeMenuIcon}
                  src={closeMenuIcon}
                  onClick={handleMenuClick}
                  alt="menu_close_icon"
                ></img>
              </div>
              <Link to="/home">
                <div className={styles.mainNavLnkBoxMobile}>
                  <div className={styles.iconAndNameMenu}>
                    <img src={homeIconWhite} />
                    <p>Home</p>
                  </div>
                  <img src={rightArrow} />
                </div>
              </Link>
              <Link to="/shop">
                <div className={styles.mainNavLnkBoxMobile}>
                  <div className={styles.iconAndNameMenu}>
                    <img src={shopIconWhite} />
                    <p>Shop</p>
                  </div>
                  <img src={rightArrow} />
                </div>
              </Link>
              {user && (
                <Link to="/orders">
                  <div className={styles.mainNavLnkBoxMobile}>
                    <div className={styles.iconAndNameMenu}>
                      <img src={orderIconWhite} />
                      <p>My Orders</p>
                    </div>
                    <img src={rightArrow} />
                  </div>
                </Link>
              )}
              <Link to="/about">
                <div className={styles.mainNavLnkBoxMobile}>
                  <div className={styles.iconAndNameMenu}>
                    <img src={aboutIconWhite} />
                    <p>About</p>
                  </div>
                  <img src={rightArrow} />
                </div>
              </Link>
              <hr />
              {!user && (
                <Link to="login">
                  <div className={styles.mainNavLnkBoxMobile}>
                    <div className={styles.iconAndNameMenu}>
                      <img src={loginIconWhite} />
                      <p>Login</p>
                    </div>
                    <img src={rightArrow} />
                  </div>
                </Link>
              )}
              {user && (
                <div className={styles.mainNavLnkBoxMobile} onClick={logout}>
                  <div className={styles.iconAndNameMenu}>
                    <img src={logoutIconWhite} />
                    <p>Logout</p>
                  </div>
                  <img src={rightArrow} />
                </div>
              )}
              {user && (
                <div
                  className={styles.mainNavLnkBoxMobile}
                  onClick={deleteAccount}
                >
                  <div className={styles.iconAndNameMenu}>
                    <img src={deleteAccIconWhite} />
                    <p>Delete Account</p>
                  </div>
                  <img src={rightArrow} />
                </div>
              )}
            </div>
            <div className={styles.OpenMenuIconBox} onClick={handleMenuClick}>
              <img
                className={styles.openMenuIcon}
                src={hamburgerMenuIcon}
                alt="menu_icon"
              />
            </div>
          </div>
        )}
        <Link to={"/home"} id={isMobile ? styles.logoMobile : styles.logo}>
          <h1>Shop Site</h1>
        </Link>

        <div className={styles.rightContainer}>
          {isDesktop && <NavbarBtn icon={homeIcon} name="Home" path="/home" />}
          {isDesktop && <NavbarBtn icon={shopIcon} name="Shop" path="/shop" />}

          {isDesktop && (
            <NavbarBtn icon={aboutIcon} name="About" path="/about" />
          )}

          {user && isDesktop && (
            <NavbarBtn icon={orderIcon} name="My Orders" path="/orders" />
          )}

          {!user && isDesktop && (
            <NavbarBtn icon={loginIcon} name="Login" path="/login" />
          )}
          <NavbarCart />
          {user && isDesktop && <NavbarSettings />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
