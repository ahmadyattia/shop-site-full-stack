// protected route

import { useAuth } from "@/context/AuthContext";
import styles from "@/styles/Profile.module.css";

const Profile = () => {
  const { user } = useAuth();

  if (!user) return;

  const userInitials = user.first_name[0] + user.last_name[0];

  return (
    <div className={styles.profile}>
      <div className={styles.initials}>
        <span>{userInitials}</span>
      </div>
      <div className={styles.userInfo}>
        <p>
          <span className={styles.label}>Name:</span> {user.first_name}{" "}
          {user.last_name}
        </p>
        <p>
          <span className={styles.label}>Email:</span> {user.email}
        </p>
        <p>
          <span className={styles.label}>Role:</span>{" "}
          {user.is_admin ? "Admin" : "Customer"}
        </p>
      </div>
    </div>
  );
};

export default Profile;
