import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { baseUrl } from "../global";

export default function StatisticsGenerator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { journalInfos } = location.state || {};

  useEffect(() => {
    const url = baseUrl + "generate-pdf";
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
      },
      body: JSON.stringify({ journalInfos }),
    })
      .then((response) => {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        if (!response.ok) {
          navigate("/login");
          throw new Error("Response is not ok");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${localStorage.getItem(
          "username"
        )}_${new Date().toLocaleDateString()}_statistics.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        navigate("/user");
      })
      .catch((e) => {
        console.error("Download error:", e);
        navigate("/404");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Loading your download...</div>;
}
