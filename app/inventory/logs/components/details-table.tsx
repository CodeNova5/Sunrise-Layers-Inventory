import React from 'react';

const renderValue = (value: any) => {
  if (Array.isArray(value)) {
    return <span className="text-neu-6 italic">{value.join(', ')}</span>;
  } else if (typeof value === 'object' && value !== null) {
    return (
      <div>
        {Object.entries(value).map(([key, val]) => (
          <div key={key} className="ml-4">
            <span className="text-acc-7 mr-2 text-[15px]">{key}:</span> {renderValue(val)}
          </div>
        ))}
      </div>
    );
  } else if (typeof value === 'string') {
    return <span>{value}</span>;
  } else if (typeof value === 'boolean' && value === true) {
    return <span className="text-neu-6 italic">all</span>;
  } else if (typeof value === 'number') {
    return <span>{value}</span>;
  } else {
    return <></>;
  }
};

interface DetailsTableProps {
  details: { [key: string]: any };
}

const DetailsTable: React.FC<DetailsTableProps> = ({ details }) => {
  return (
    <div className="font-nunito">
      {Object.entries(details).map(([key, value]) => (
        <div key={key} className="ml-6">
          <span className="text-acc-7 mr-2 text-[15px]">{key}:</span> {renderValue(value)}
        </div>
      ))}
    </div>
  );
};

export default DetailsTable;