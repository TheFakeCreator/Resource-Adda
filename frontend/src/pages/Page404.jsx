import React from 'react'
import "./Page404.css"
import hb from "../assets/404.gif"

export default function Page404() {
  return (
    <div class="home-404">
      <div class="container-404">
        <div class="section-1-404">
            <div class="topper-sec-404">
                <img src={hb} alt="404 Gif" class="gif-img-404"/>
                <div class="text-404">Bhai tu bhatak gaya hai</div>
                <a href="/" class="btn res-btn">Wapas Jaa</a>
            </div>
        </div>
    </div>
    </div>
  )
}
