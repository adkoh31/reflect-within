"use client" 

import * as React from "react"
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

const TextPressure = ({
    text = 'Compressa',
    fontFamily = 'Compressa VF',
    fontUrl = 'https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2',
    width = true,
    weight = true,
    italic = true,
    alpha = false,
    flex = true,
    stroke = false,
    scale = false,
    textColor = '#FFFFFF',
    strokeColor = '#FF0000',
    strokeWidth = 2,
    className = '',
    minFontSize = 24,
}) => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const spansRef = useRef([]);
    const animationRef = useRef(null);

    const mouseRef = useRef({ x: 0, y: 0 });
    const cursorRef = useRef({ x: 0, y: 0 });

    const [fontSize, setFontSize] = useState(minFontSize);
    const [scaleY, setScaleY] = useState(1);
    const [lineHeight, setLineHeight] = useState(1);

    // Memoize characters array to prevent recreation
    const chars = useMemo(() => text.split(''), [text]);

    // Memoize distance calculation function
    const dist = useCallback((a, b) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }, []);

    // Memoize attribute calculation function
    const getAttr = useCallback((distance, minVal, maxVal, maxDist) => {
        const val = maxVal - Math.abs((maxVal * distance) / maxDist);
        return Math.max(minVal, val + minVal);
    }, []);

    // Cleanup animation frame
    const cleanupAnimation = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            cursorRef.current.x = e.clientX;
            cursorRef.current.y = e.clientY;
        };
        const handleTouchMove = (e) => {
            const t = e.touches[0];
            cursorRef.current.x = t.clientX;
            cursorRef.current.y = t.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });

        if (containerRef.current) {
            const { left, top, width, height } = containerRef.current.getBoundingClientRect();
            mouseRef.current.x = left + width / 2;
            mouseRef.current.y = top + height / 2;
            cursorRef.current.x = mouseRef.current.x;
            cursorRef.current.y = mouseRef.current.y;
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cleanupAnimation();
        };
    }, [cleanupAnimation]);

    const setSize = useCallback(() => {
        if (!containerRef.current || !titleRef.current) return;

        const { width: containerW, height: containerH } = containerRef.current.getBoundingClientRect();

        let newFontSize = containerW / (chars.length / 2);
        newFontSize = Math.max(newFontSize, minFontSize);

        setFontSize(newFontSize);
        setScaleY(1);
        setLineHeight(1);

        requestAnimationFrame(() => {
            if (!titleRef.current) return;
            const textRect = titleRef.current.getBoundingClientRect();

            if (scale && textRect.height > 0) {
                const yRatio = containerH / textRect.height;
                setScaleY(yRatio);
                setLineHeight(yRatio);
            }
        });
    }, [scale, chars.length, minFontSize]);

    useEffect(() => {
        setSize();
        window.addEventListener('resize', setSize);
        return () => window.removeEventListener('resize', setSize);
    }, [setSize]);

    useEffect(() => {
        // Cleanup previous animation
        cleanupAnimation();

        const animate = () => {
            mouseRef.current.x += (cursorRef.current.x - mouseRef.current.x) / 15;
            mouseRef.current.y += (cursorRef.current.y - mouseRef.current.y) / 15;

            if (titleRef.current) {
                const titleRect = titleRef.current.getBoundingClientRect();
                const maxDist = titleRect.width / 2;

                spansRef.current.forEach((span) => {
                    if (!span) return;

                    const rect = span.getBoundingClientRect();
                    const charCenter = {
                        x: rect.x + rect.width / 2,
                        y: rect.y + rect.height / 2,
                    };

                    const d = dist(mouseRef.current, charCenter);

                    const wdth = width ? Math.floor(getAttr(d, 5, 200, maxDist)) : 100;
                    const wght = weight ? Math.floor(getAttr(d, 100, 900, maxDist)) : 400;
                    const italVal = italic ? getAttr(d, 0, 1, maxDist).toFixed(2) : '0';
                    const alphaVal = alpha ? getAttr(d, 0, 1, maxDist).toFixed(2) : '1';

                    span.style.opacity = alphaVal;
                    span.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}, 'ital' ${italVal}`;
                });
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();
        
        return cleanupAnimation;
    }, [width, weight, italic, alpha, chars.length, dist, getAttr, cleanupAnimation]);

    // Memoize styles to prevent unnecessary re-renders
    const titleStyle = useMemo(() => ({
        fontFamily,
        fontSize: fontSize,
        lineHeight,
        transform: `scale(1, ${scaleY})`,
        transformOrigin: 'center top',
        margin: 0,
        fontWeight: 100,
        color: stroke ? undefined : textColor,
    }), [fontFamily, fontSize, lineHeight, scaleY, stroke, textColor]);

    const containerStyle = useMemo(() => ({
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'transparent'
    }), []);

    return (
        <div
            ref={containerRef}
            style={containerStyle}
            className="relative w-full h-full overflow-hidden bg-transparent"
        >
            <style>{`
        @font-face {
          font-family: '${fontFamily}';
          src: url('${fontUrl}');
          font-style: normal;
        }
        .stroke span {
          position: relative;
          color: ${textColor};
        }
        .stroke span::after {
          content: attr(data-char);
          position: absolute;
          left: 0;
          top: 0;
          color: transparent;
          z-index: -1;
          -webkit-text-stroke-width: ${strokeWidth}px;
          -webkit-text-stroke-color: ${strokeColor};
        }
      `}</style>

            <h1
                ref={titleRef}
                className={`text-pressure-title ${className} ${flex ? 'flex justify-between' : ''
                    } ${stroke ? 'stroke' : ''} uppercase text-center`}
                style={titleStyle}
            >
                {chars.map((char, i) => (
                    <span
                        key={i}
                        ref={(el) => (spansRef.current[i] = el)}
                        data-char={char}
                        className="inline-block"
                    >
                        {char}
                    </span>
                ))}
            </h1>
        </div>
    );
};

export default TextPressure; 