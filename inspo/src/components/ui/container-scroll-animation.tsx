"use client";

import {
  type MotionValue,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import React, { useRef } from "react";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode | null;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.9, 0.7] : [1, 1.05];
  };

  const scaleStart = scaleDimensions()[0];
  const scaleEnd = scaleDimensions()[1];

  // Compress animation to happen in first 40% of scroll for faster response
  // Card starts transformed and returns to normal as you scroll
  const rotate = useTransform(scrollYProgress, [0, 0.4, 1], [25, 0, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    [scaleEnd, scaleStart, scaleStart],
  );
  const translate = useTransform(scrollYProgress, [0, 0.4, 1], [0, -80, -80]);
  const cardTranslate = useTransform(scrollYProgress, [0, 0.4, 1], [-40, 0, 0]);

  return (
    <div
      className="min-h-[36rem] md:min-h-[46rem] -mt-[85vh] md:-mt-[90vh] flex items-start justify-center relative p-0"
      ref={containerRef}
    >
      <div
        className="p-0 w-full relative flex flex-col items-center"
        style={{
          perspective: "1000px",
        }}
      >
        {titleComponent && (
          <Header translate={translate} titleComponent={titleComponent} />
        )}
        <Card rotate={rotate} translate={cardTranslate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  translate,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        translateY: translate,
        boxShadow:
          "0 9px 20px rgba(0, 0, 0, 0.15), 0 37px 37px rgba(0, 0, 0, 0.1), 0 84px 50px rgba(0, 0, 0, 0.08), 0 149px 60px rgba(0, 0, 0, 0.05), 0 233px 65px rgba(0, 0, 0, 0.02)",
      }}
      className="max-w-5xl mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#e5e7eb] bg-white rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-auto rounded-2xl bg-white md:rounded-2xl px-4 md:px-6 py-3 md:py-4 max-w-[1000px] mx-auto flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};
