import React from 'react'
import './Instructions.css'
import i1 from '../../assets/i1.png'
import i2 from '../../assets/i2.png'
import i3 from '../../assets/i3.png'

const Instructions = () => {
  return (
    <section className="instructions-section container">
      <h2>Here's How Bento's Prepared Meal Delivery Works</h2>

      <div className="instructions">
        <div className="instruction">
          <img src={i1} alt="create account" />
          <h3>1. Create your account</h3>
          <p>Sign up in seconds and start ordering fresh, chef-crafted meals today.</p>
        </div>

        <div className="instruction">
          <img src={i2} alt="select meals" />
          <h3>2. Select your meals</h3>
          <p>Choose from a variety of nutritious, ready-to-heat meals that fit your schedule.</p>
        </div>

        <div className="instruction">
          <img src={i3} alt="enjoy food" />
          <h3>3. Get your meals delivered</h3>
          <p>Receive fresh, ready-made meals delivered to your door—no prep, no cleanup.</p>
        </div>
      </div>

      <button className="btn">GET STARTED</button>
    </section>
  )
}

export default Instructions
