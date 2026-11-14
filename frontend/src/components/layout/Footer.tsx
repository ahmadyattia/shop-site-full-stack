// this component is designed with a mobile-first approach

import styles from "@/styles/layout/Footer.module.css";
import githubLogo from "@/assets/images/icons/GitHub_Lockup_White.svg";

const Footer = () => {
  return (
    <div>
      <div className={styles.main}>
        <div className={styles.grid}>
          <ul>
            <li>Legal</li>
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Warranty Info</li>
          </ul>
          <ul>
            <li>Support</li>
            <li>Help Center</li>
            <li>FAQs</li>
            <li>Order Tracking</li>
            <li>Shipping Info</li>
          </ul>
          <ul>
            <li>Resources</li>
            <li>Our Blog</li>
            <li>Pricing</li>
            <li>Newsletter</li>
          </ul>
          <ul>
            <li>About</li>
            <li>About Us</li>
            <li>Careers</li>
            <li>Events</li>
            <li>Blog</li>
          </ul>
        </div>
        <div className={styles.githubIconBox}>
          <a
            href="https://github.com/ahmadyattia/shop-site-full-stack.git"
            target="_blank"
          >
            <img src={githubLogo} alt="" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Footer;
