function ResumePage({ children, className = "" }) {
  return (
    <div className={`resume-page ${className}`}>
      {children}
    </div>
  );
}

export default ResumePage;