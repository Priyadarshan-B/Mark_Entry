import axios from "axios";
import { getDecryptedCookie, removeEncryptedCookie } from "./encrypt";
import {jwtDecode} from "jwt-decode";

const apiHost = import.meta.env.VITE_API_HOST;

const requestApi = async (method, url, data, navigate) => {
  try {
    const decryptedUserData = getDecryptedCookie("authToken");

    if (!decryptedUserData) {
      navigate('/login')
      throw new Error("No auth token found. Please log in.");
    }

    const decodedToken = jwtDecode(decryptedUserData);
    const currentTime = Date.now() / 1000; 

    if (decodedToken.exp < currentTime) {
      removeEncryptedCookie("authToken");

      removeEncryptedCookie("allowedRoutes");
      navigate("/login");
      return { success: false, error: "Token expired. Redirecting to login." };
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${decryptedUserData}`,
    };

    let response;
    switch (method) {
      case "POST":
        response = await axios.post(apiHost + url, data, { headers });
        break;
      case "GET":
        response = await axios.get(apiHost + url, { headers });
        break;
      case "PUT":
        response = await axios.put(apiHost + url, data, { headers });
        break;
      case "DELETE":
        response = await axios.delete(apiHost + url, { headers });
        break;
      default:
        throw new Error(`Unsupported request method: ${method}`);
    }

    if (!response) {
      throw new Error("No response from the server");
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in requestApi:", error);
    if (error.response && error.response.status === 403) {
      const errorMessage = error.response.data.message;
      if (errorMessage === "Token has expired") {
        removeEncryptedCookie("authToken");
      removeEncryptedCookie("allowedRoutes");
        navigate("/login");
      }
    }
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    };
  }
};

export default requestApi;
