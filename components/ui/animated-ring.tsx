import React from "react";
/**
 * @param {{ isPlaying: boolean, isChanging: boolean }} props
 */
export default function AnimatedRing(props: any) {
  const { isPlaying, isChanging } = props;
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    let raf;
    let running = true;
    function animate() {
      const t = performance.now() / 1000;
      // Pulse effect: scale up and down
      const base = isPlaying ? (1 + 0.12 * Math.sin(t * 2.2)) : 1;
      setScale(base);
      if (running) raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [isPlaying]);
  return (
    <span
      style={{
        display: "inline-block",
        width: "70%",
        height: "70%",
        borderRadius: "50%",
        border: isChanging ? "2px dashed #fff" : "2px solid #fff",
        opacity: isPlaying ? 0.8 : 0.4,
        background: isPlaying ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
        transform: `scale(${scale})`,
        transition: "border 0.3s, background 0.3s, opacity 0.3s",
      }}
    />
  );
}