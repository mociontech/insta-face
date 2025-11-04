"use client";
import { useEffect, useState, useRef } from "react";
export default function WelcomePage() {
  const [htmlTotem, setHtmlTotem] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/Totem Latina/index.html")
      .then((res) => res.text())
      .then((data) => setHtmlTotem(data));
  }, []);

  useEffect(() => {
    if (!htmlTotem || !containerRef.current) return;

    // Ejecutar los scripts después de que el HTML se haya inyectado
    const scripts = containerRef.current.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [htmlTotem]);

  return (
    <div
      ref={containerRef}
      className="welcome h-auto w-auto flex justify-center items-center"
      dangerouslySetInnerHTML={{ __html: htmlTotem }}
    ></div>
  );
}
