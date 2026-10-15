/**
 * Single module entry for the portfolio.
 *
 * Ticket 001 shipped the scaffold; this file wires the moving parts. Ticket 002
 * adds the smooth-scroll foundation. Reveals arrive in 003 and the i18n
 * bootstrap in 004; keeping one entry point means later tickets have exactly one
 * place from which to import.
 */

import { initSmoothScroll } from "./motion/smooth-scroll.js";

initSmoothScroll();
