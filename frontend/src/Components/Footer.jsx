import { banner, logo1 } from "../assets/assets";

function Footer() {
  return (
  
      <div className="   w-full   border-2 sm:h-[49vh]  relative  mt-40 ">
        <img
          className=" w-full  sm:w-full shrink-0   sm:h-[49vh]"
          src={banner}
          alt=""
        />
        <div className=" absolute shrink-0  flex-col  sm:grid grid-cols-[1fr_1fr_1fr_1fr] gap-14    top-0 bg-black opacity-80">
          <div className="flex flex-col sm:ml-40 mt-6 pl-10  p-4 w-[370px] ">
            <img className="w-70  "  src={logo1} alt="" />
            <p className="text-white text-[19px] text-wrap    font-light ">
              We RKGITM, were earlier RKGITW (established in 2008) where we
              imparted technical education based on the philosophy of Teach a
              girl Teach a family. RKGITW received several merit awards for its
              performance. Now we have been converted from Only Women Education
              to Co-ed Institute namely RKGITM (from the session 2016-17) in
              view of globalization and gender equality.
            </p>
          </div>
          <div className="flex flex-col sm:ml-40 mt-6 pl-10  p-4 w-[370px] ">
            <img className="w-70  "  src={logo1} alt="" />
            <p className="text-white text-[19px] text-wrap    font-light ">
              We RKGITM, were earlier RKGITW (established in 2008) where we
              imparted technical education based on the philosophy of Teach a
              girl Teach a family. RKGITW received several merit awards for its
              performance. Now we have been converted from Only Women Education
              to Co-ed Institute namely RKGITM (from the session 2016-17) in
              view of globalization and gender equality.
            </p>
          </div>
          <div>

          </div>
        </div>
      </div>
    
  );
}

export default Footer;
