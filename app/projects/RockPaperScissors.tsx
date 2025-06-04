import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Chart from 'chart.js/auto';


gsap.registerPlugin(ScrollTrigger);

function Rps() {
    return(
        <h1>RPS</h1>
    )
}

export default Rps;