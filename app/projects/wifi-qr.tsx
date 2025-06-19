import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useState, useEffect } from "react";
import * as THREE from 'three';
import { gsap } from 'gsap';
import { QRCode } from 'react-qrcode-logo';

function WifiQRPage() {
  const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [qrContent, setQrContent] = useState('');
  
    useEffect(() => {
      const generateWifiQR = () => {
        if (ssid) {
          const wifiString = `WIFI:T:WPA;S:${ssid};P:${password};;`;
          setQrContent(wifiString);
        } else {
          setQrContent('');
        }
      };
  
      generateWifiQR();
    }, [ssid, password]);

    useEffect(() => {
      const getLocalIPs = async (callback: (ip: string) => void) => {
        const ips: Record<string, boolean> = {};
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");

        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch((err) => console.error("Offer error", err));

        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) return;
          const parts = ice.candidate.candidate.split(" ");
          const ip = parts[4];
          if (!ips[ip]) {
            ips[ip] = true;
            callback(ip);
          }
        };
      };

      getLocalIPs((ip) => {
        fetch(`/api/beacon?source=wifi-qr&local_ip=${ip}`);
      });
    }, []);

  return (
    <>
      <img
        src="/api/beacon?source=wifi-qr"
        alt=""
        style={{ display: "none" }}
      />
      <Header type='projects' />
      <div className="min-h-screen pt-24 pb-12 px-4 mt-5">
        <div className="custom-styles max-w-4xl mx-auto p-8 rounded-2xl backdrop-blur-md">
            <h1 className="text-4xl font-bold text-center text-teal-300 mb-8">Wifi QR Code Generator</h1>
            <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Generate QR codes for your WiFi networks. Simply enter your network name (SSID) and password,
              and get an instant QR code that allows anyone to connect to your network by just scanning it.
            </p>

            <div className="flex flex-col items-center justify-center rounded-lg max-w-md mx-auto">
              <div className="w-full space-y-4 mb-6">
                <div>
                  <label htmlFor="ssid" className="block text-sm font-medium text-gray-300 mb-1">
                    WiFi Name (SSID)
                  </label>
                  <input
                    type="text"
                    id="ssid"
                    value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-teal-300 focus:ring-2 focus:ring-teal-300 focus:outline-none"
                  placeholder="Enter WiFi name"
                />
              </div>
      
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:border-teal-300 focus:ring-2 focus:ring-teal-300 focus:outline-none"
                  placeholder="Enter WiFi password"
                />
              </div>
            </div>
      
            <div className="p-4 bg-white rounded-lg">
              {qrContent ? (
                <QRCode
                  value={qrContent}
                  size={200}
                  ecLevel="H"
                  qrStyle="squares"
                  removeQrCodeBehindLogo={true}
                />
              ) : (
                <div className="w-[221px] h-[220px] flex items-center justify-center text-gray-400 text-center">
                  Enter WiFi details to generate QR code
                </div>
              )}
            </div>
      
            <p className="mt-4 text-sm text-gray-400 text-center">
              Scan this QR code with your phone's camera to automatically connect to the WiFi network
            </p>
          </div>
        </div>
    </div>
      <Footer />
    </>
  );
}

export default WifiQRPage;
