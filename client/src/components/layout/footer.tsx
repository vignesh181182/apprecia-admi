export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 mt-8 border-t border-stone-200">
      <div className="px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="text-center lg:text-left">
            <div className="text-sm text-stone-600">
              © {currentYear} EngageX. All rights reserved.
            </div>
          </div>
          <div className="flex space-x-6">
            <a href="#!" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">About</a>
            <a href="#!" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Help</a>
            <a href="#!" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
