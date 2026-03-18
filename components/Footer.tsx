export function Footer() {
  return (
    <footer className="bg-[#1a365d] text-white py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-blue-200">
          &copy; 2026 VITAL Health Technologies
        </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="text-blue-200 hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="text-blue-200 hover:text-white transition-colors">
            Terms of Service
          </a>
          <a href="#" className="text-blue-200 hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
