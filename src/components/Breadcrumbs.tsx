import React from 'react';



const Breadcrumbs: React.FC = () => {
  return (
    <div className="flex items-center text-xl font-bold text-slate-100 flex-wrap">
      <button 
        className="hover:text-cyan-400 transition-colors"
      >
        My Drive
      </button>

      {/* {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <BreadcrumbArrowIcon className="w-5 h-5 text-slate-500 mx-1" />
          {index === path.length - 1 ? (
             <span className="text-slate-300">{folder.name}</span>
          ) : (
            <button 
              onClick={() => onNavigate(folder.id)}
              className="hover:text-cyan-400 transition-colors"
            >
              {folder.name}
            </button>
          )}
        </React.Fragment>
      ))} */}
    </div>
  );
};

export default Breadcrumbs;
