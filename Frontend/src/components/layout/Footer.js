import styles from '../../../styles/Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.copyright}>
          &copy; {currentYear} <span className={styles.brand}>Admin Portal</span>. 
          All rights reserved.
        </div>
        <div className={styles.footerLinks}>
          <a href="#" className={styles.link}>Support</a>
          <span className={styles.dot}>•</span>
          <a href="#" className={styles.link}>Privacy Policy</a>
          <span className={styles.dot}>•</span>
          <a href="#" className={styles.link}>v1.0.4</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;