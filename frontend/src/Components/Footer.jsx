import { banner, logo1 } from "../assets/assets";

function Footer() {

  return (
    <div className="w-full border-2 relative">
      <img
        className="w-full h-[1000px] object-cover sm:h-[49vh]"
        src={banner}
        alt=""
      />
      <div className="absolute inset-0 bg-black opacity-80">
        <div className="flex flex-col sm:grid sm:grid-cols-[1fr_1fr_2fr] gap-6 p-4">
          <div className="flex flex-col sm:ml-10 mt-6 sm:mt-0">
            <img className="w-40 mb-4" src={logo1} alt="" />
            <p className="text-white text-sm sm:text-base font-light">
              We RKGITM, were earlier RKGITW (established in 2008) where we
              imparted technical education based on the philosophy of Teach a
              girl Teach a family. RKGITW received several merit awards for its
              performance. Now we have been converted from Only Women Education
              to Co-ed Institute namely RKGITM (from the session 2016-17) in
              view of globalization and gender equality.
            </p>
          </div>
          <div className="flex flex-col sm:ml-10 mt-6 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4">
              ABOUT <span className="text-red-800">US</span>
            </h1>
            {[
              "Vision & Mission",
              "About RKGITM",
              "Chancellor Message",
              "Chairman Message",
              "Group Advisor Message",
              "Director Message",
              "Life at RKGITM",
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-2 items-center text-white hover:text-red-800 font-light mb-2"
              >
                <i className="ri-arrow-right-circle-line text-lg sm:text-xl"></i>
                <p className="text-sm sm:text-base font-medium">{item}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:ml-10 mt-6 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 mb-4">
              GET IN <span className="text-red-800">TOUCH</span>
            </h1>
            {[
              {
                icon: "ri-map-pin-line",
                text: "5th Km Stone Delhi Meerut Road Ghaziabad (U.P)201003",
              },
              {
                icon: "ri-cellphone-fill",
                text: "+91-9310089933",
              },
              {
                icon: "ri-phone-fill",
                text: "(0120)27847792784776",
              },
              {
                icon: "ri-message-fill",
                text: "info@rkgitm.ac.in",
              },
              {
                icon: "ri-message-fill",
                text: "director@rkgitm.ac.in",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex gap-2 items-center text-white font-light mb-2"
              >
                <i
                  className={`${item.icon} text-lg sm:text-xl text-red-800`}
                ></i>
                <p className="text-sm sm:text-base font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
