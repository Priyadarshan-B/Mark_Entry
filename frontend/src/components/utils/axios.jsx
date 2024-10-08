import axios from "axios";
import { getDecryptedCookie } from "./encrypt";

const apiHost = import.meta.env.VITE_API_HOST;

const requestApi = async (method, url, data) => {
  try {
    const decryptedUserData = getDecryptedCookie("authToken");


    const headers = {
      "Content-Type": "application/json",
      ...(decryptedUserData && { Authorization: `Bearer ${decryptedUserData}` }),
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
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    };
  }
};

export default requestApi;
