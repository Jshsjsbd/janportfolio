import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'


const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#13141a]">
      <Ring
        size="60"
        stroke="5"
        bgOpacity="0"
        speed="2"
        color="cyan" 
      />
    </div>
  );
};

export default Loader;