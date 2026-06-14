import React from 'react'
import { useNavigate } from 'react-router-dom'
import "./Button.css"
import { motion } from 'framer-motion';

export default function NavigateButton({path, text, className}) {
  const navigate = useNavigate();

  const handleNav = () => {
    navigate(path);
  }

  return (
    <motion.div whileHover={{scale: 1.1}} whileTap={{scale: .9}} className={'nav-btn btn ' + className} onClick={handleNav}>
      {text}
    </motion.div>
  )
}
