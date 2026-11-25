'use client'

import React from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'

export const LUXURY_EASE = [0.22, 1, 0.36, 1] as const

interface RevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  delay?: number
  y?: number
  duration?: number
}

/**
 * Scroll-triggered upward fade-in reveal. Triggers once when entering the viewport.
 */
export function Reveal({
  children,
  delay = 0,
  y = 22,
  duration = 0.55,
  className,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease: LUXURY_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Immediate page-load entrance for headings and top-of-page hero content.
 */
export function PageEntrance({
  children,
  delay = 0,
  y = 18,
  duration = 0.45,
  className,
  ...props
}: RevealProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : duration, delay: reduce ? 0 : delay, ease: LUXURY_EASE }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  staggerDelay?: number
}

/**
 * Staggers child StaggerItem animations once when the container enters the viewport.
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  className,
  ...props
}: StaggerContainerProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduce ? 0 : staggerDelay,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<'div'> & { children: React.ReactNode }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: reduce ? 0 : 0.5, ease: LUXURY_EASE },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
