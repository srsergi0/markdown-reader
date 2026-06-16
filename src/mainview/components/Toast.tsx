import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

type Props = {
  message: string;
  visible: boolean;
  onDone?: () => void;
  duration?: number;
};

export default function Toast({ message, visible, onDone, duration = 2000 }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) { setShow(false); return; }
    setShow(true);
    const timer = setTimeout(() => {
      setShow(false);
      onDone?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDone]);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-fade-in">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-xl bg-[var(--bg-sidebar)] border border-[var(--border-main)] text-[var(--text-main)] text-sm font-medium">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        {message}
      </div>
    </div>
  );
}
