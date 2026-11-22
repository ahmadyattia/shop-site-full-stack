import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import styles from "../styles/ProfileLink.module.css";

const ProfileLink = () => {
  const { user } = useAuth();

  if (!user) return;

  const userInitials = user.first_name[0] + user.last_name[0];

  return (
    <Link to={"profile"} className={styles.link} title="View Profile">
      <span className={styles.initials}>{userInitials}</span>
    </Link>
  );
};

export default ProfileLink;
