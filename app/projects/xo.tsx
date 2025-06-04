import Header from '../components/Header';
import Footer from "../components/Footer";
import "../app.css";
import React, { useEffect, useRef } from "react";
import * as THREE from 'three';
import { gsap } from 'gsap';
import Chart from 'chart.js/auto';


gsap.registerPlugin(ScrollTrigger);

function Xo() {
    return(
        <h1>XO</h1>
    )
}

export default Xo;