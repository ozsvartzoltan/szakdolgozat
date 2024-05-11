import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { baseUrl } from "../global";
import { useNavigate, useLocation } from "react-router-dom";

export default function Upgrade() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [amount] = useState(100); // Amount in cents
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    console.log(
      "Use these details to make a test purchase. Expiry can be any date in the future and cvc can be any 3 digits. For further information visit https://docs.stripe.com/testing?testing-method=card-numbers "
    );
    console.log({
      cardNumber: 4242424242424242,
      expiry: "12/30",
      cvc: 123,
    });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isOnline) {
      setError("No internet connection available.");
      return;
    }
    setLoading(true);
    setError("");

    if (!stripe || !elements) {
      navigate("/home");
      setLoading(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardNumberElement),
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      console.log("PaymentMethod:", paymentMethod);
      const url = baseUrl + "create-payment-intent";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("refreshToken")}`,
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          amount: amount,
        }),
      })
        .then((response) => {
          if (response.status === 401) {
            navigate("/login", {
              state: {
                previousUrl: location.pathname,
              },
            });
          }
          if (response.status === 403) {
            navigate("/404");
          }
          return response.json();
        })
        .then((data) => {
          setLoading(false);
          navigate("/user");
        })
        .catch((error) => {
          setError("Sikertelen fizetés. Kérem próbálja újra később.");
          setLoading(false);
        });
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: "Arial, sans-serif",
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <>
      <div className="max-w-md mx-auto p-4 mt-10 bg-white rounded-lg shadow-lg">
        <h2 className="text-center text-gray-800 mb-4">Előfizetés</h2>
        <h5 className="text-center text-gray-800 mb-6">
          Összeg: <b>${amount / 100}</b>
        </h5>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-3">
            <label htmlFor="cardNumber" className="font-semibold text-gray-700">
              Kártyaszám:
            </label>
            <CardNumberElement
              id="cardNumber"
              options={cardStyle}
              className="p-3 bg-gray-100 rounded shadow-sm"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="expiry" className="font-semibold text-gray-700">
                Lejárati dátum:
              </label>
              <CardExpiryElement
                id="expiry"
                options={cardStyle}
                className="p-3 bg-gray-100 rounded shadow-sm"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="cvc" className="font-semibold text-gray-700">
                CVC:
              </label>
              <CardCvcElement
                id="cvc"
                options={cardStyle}
                className="p-3 bg-gray-100 rounded shadow-sm"
              />
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-center text-sm mt-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={!stripe || loading}
            className={`mt-4 w-full bg-purple-600 hover:bg-purple-700 ${
              loading ? "bg-gray-400" : ""
            } text-white font-bold py-2 px-4 rounded transition-colors duration-200 ease-in-out`}
          >
            {loading ? "Töltés folyamatban..." : "Fizetés"}
          </button>
        </form>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => {
            navigate("/user");
          }}
          className="w-48 mt-4 bg-purple-600 shadow-sm hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Vissza
        </button>
      </div>
    </>
  );
}
