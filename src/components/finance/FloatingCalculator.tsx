import { useState } from "react"
import { Calculator, X } from "lucide-react"
import { motion } from "framer-motion"
import { useLang } from "@/i18n/LanguageContext"
import { t } from "@/i18n/translations"
import { logger } from "@/lib/logger"

interface FloatingCalculatorProps {
  onResult: (value: string) => void
  onClose: () => void
}

function safeEval(expr: string): number {
  const tokens = expr.match(/(\d+\.?\d*|[+\-*/()])/g)
  if (!tokens) return NaN

  const nums: number[] = []
  const ops: string[] = []

  const precedence = (op: string) => {
    if (op === "+" || op === "-") return 1
    if (op === "*" || op === "/") return 2
    return 0
  }

  const applyOp = () => {
    const b = nums.pop()!
    const a = nums.pop()!
    const op = ops.pop()!
    if (op === "+") nums.push(a + b)
    else if (op === "-") nums.push(a - b)
    else if (op === "*") nums.push(a * b)
    else if (op === "/") nums.push(b === 0 ? NaN : a / b)
  }

  for (const token of tokens) {
    if (token === "(") {
      ops.push(token)
    } else if (token === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") {
        applyOp()
      }
      ops.pop()
    } else if (["+", "-", "*", "/"].includes(token)) {
      while (
        ops.length &&
        ops[ops.length - 1] !== "(" &&
        precedence(ops[ops.length - 1]) >= precedence(token)
      ) {
        applyOp()
      }
      ops.push(token)
    } else {
      nums.push(parseFloat(token))
    }
  }
  while (ops.length) applyOp()
  return nums[0]
}

export default function FloatingCalculator({
  onResult,
  onClose,
}: FloatingCalculatorProps) {
  const { lang } = useLang()
  const [expression, setExpression] = useState("")
  const [display, setDisplay] = useState("0")

  const handleNumber = (num: string) => {
    if (display === "0" && num !== ".") {
      setDisplay(num)
    } else {
      setDisplay(display + num)
    }
  }

  const handleOperator = (op: string) => {
    setExpression(expression + display + " " + op + " ")
    setDisplay("0")
  }

  const handleEquals = () => {
    try {
      const fullExpr = expression + display
      const sanitized = fullExpr.replace(/[^0-9+\-*/() ]/g, "").trim()
      if (!sanitized) return
      const result = safeEval(sanitized)
      if (isFinite(result)) {
        const rounded = Math.round(result * 100) / 100
        setDisplay(rounded.toString())
        setExpression("")
      }
    } catch (e) {
      logger.error("FloatingCalculator", "calculation failed", e)
      setDisplay("Error")
    }
  }

  const handleClear = () => {
    setDisplay("0")
    setExpression("")
  }

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay("0")
    }
  }

  const handleConfirm = () => {
    try {
      const fullExpr = expression + display
      const sanitized = fullExpr.replace(/[^0-9+\-*/() ]/g, "").trim()
      if (!sanitized) return
      const result = safeEval(sanitized)
      if (isFinite(result)) {
        const rounded = Math.round(result * 100) / 100
        setDisplay(rounded.toString())
        setExpression("")
        onResult(rounded.toString())
      } else {
        onResult(display)
      }
    } catch (e) {
      logger.error("FloatingCalculator", "calculation failed", e)
      onResult(display)
    }
  }

  const buttons = [
    ["C", "(", ")", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    [".", "0", "⌫", "="],
  ]

  const getButtonStyle = (btn: string) => {
    if (btn === "=") return "bg-[var(--pv-blue)] text-white font-bold"
    if (btn === "C") return "bg-red-500/10 text-red-500 font-semibold"
    if (["+", "-", "×", "÷"].includes(btn))
      return "bg-foreground/5 text-[var(--pv-blue)] font-semibold"
    return "bg-foreground/5 text-foreground"
  }

  const handleButton = (btn: string) => {
    if (btn === "C") handleClear()
    else if (btn === "⌫") handleBackspace()
    else if (btn === "=") handleEquals()
    else if (btn === ".") handleNumber(".")
    else if (btn === "(" || btn === ")") {
      setExpression(expression + btn)
    } else if (["+", "-", "×", "÷"].includes(btn)) {
      const op = btn === "×" ? "*" : btn === "÷" ? "/" : btn
      handleOperator(op)
    } else handleNumber(btn)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute bottom-full right-0 mb-2 z-50 w-64 max-w-[calc(100vw-2rem)]"
    >
      <div className="glass-strong rounded-2xl p-3 shadow-xl border border-border/40">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Calculator className="size-3.5 text-[var(--pv-blue)]" />
            <span className="text-xs font-semibold text-foreground">
              {t("expense.calculator", lang)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-foreground/5 rounded-lg"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Display */}
        <div className="bg-foreground/5 rounded-xl p-2 mb-2">
          {expression && (
            <div className="text-xs text-muted-foreground text-right truncate mb-0.5">
              {expression}
            </div>
          )}
          <div className="text-right text-lg font-bold text-foreground tabular-nums truncate">
            ৳{display}
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {buttons.flat().map((btn) => (
            <button
              key={btn}
              onClick={() => handleButton(btn)}
              className={`h-10 rounded-lg text-sm font-medium transition-all active:scale-95 ${getButtonStyle(btn)}`}
            >
              {btn}
            </button>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className="w-full mt-2 py-2 rounded-xl bg-[var(--pv-blue)] text-white text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.98]"
        >
          {t("expense.useResult", lang)}
        </button>
      </div>
    </motion.div>
  )
}
