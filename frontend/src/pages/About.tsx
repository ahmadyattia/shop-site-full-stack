import styles from "@/styles/About.module.css";
import personalPic from "@/assets/images/personal-pic.jpeg";

const About = () => {
  return (
    <article className={styles.main}>
      <div className={styles.picBox}>
        <img
          className={styles.personalPic}
          src={personalPic}
          alt="Ahmed - Frontend Developer profile photo"
        />
      </div>
      <div>
        <h2 className={styles.title}>About Me</h2>
        <p className={styles.paragraph}>
          Hi, I'm Ahmed, a fullstack developer focused on building websites that
          are efficient and user-friendly.
        </p>
        <p className={styles.paragraph}>
          I'm currently deepening my frontend and backend skills and building
          projects. I'm very passionate about what I do.
        </p>
        <h2 className={styles.title}>About This Website</h2>
        <p className={styles.paragraph}>
          This project showcases my skills and abilities as a fullstack
          developer.
        </p>
        <p className={styles.paragraph}>
          It features a custom backend API and a fully responsive user
          interface. I built it with professionalism and in a detail-oriented
          way.
        </p>
        <p className={styles.paragraph}>
          I used Github for version control for this website. You'll find a link
          to the repository at the very bottom of the page.
        </p>
      </div>
    </article>
  );
};

export default About;
