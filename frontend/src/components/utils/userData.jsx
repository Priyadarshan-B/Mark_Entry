import { useEffect, useState } from "react";
import { getCookie } from "./encrypt";

const useUserData = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const userdata = getCookie("userdata");
    if (userdata) {
      try {
        const parsedUserData = JSON.parse(userdata);
        setUserData(parsedUserData);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
    setLoading(false);
  }, []);

  return { userData, loading };
};

export default useUserData;
