import React from 'react'
import './Navbar.css'
import logo from '../../assets/logo.svg'

const Navbar = () => {
  return (
    <nav className="container">
      <section>
      <img src={logo} alt="logo" className="logo"/>
      <ul>
        <li>Menu</li>
        <li>About Us</li>
        <li>FAQs</li>
        <li>Contact us</li>
      </ul>
      </section>
      <section>
        <button className="btn-nav">Login</button>
      </section>
    </nav>
  )
}

export default Navbar
