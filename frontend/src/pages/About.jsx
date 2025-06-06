 

import { about, } from "../assets/assets"
 
 

 
const About = () => {
  return (
    <div  >
      <div className="text-2xl text-center pt-8 border-t">
         <h1 className=" text-3xl sm:text-7xl   flex justify-center sm:mt-10 mt-8 font-bold  text-blue-900   text-wrap ">
             About <span className="text-red-500 ml-3"> Us</span>
          </h1>
      </div>
       <div className="flex  my-8  sm:gap-30 flex-col md:flex-row gap-10">
         <img src={about} className="w-full md:max-w-[650px]  " alt="" />
         <div className="flex   flex-col  justify-center   gap-6  md:w-2/4  text-gray-600">
         <p className="p-5">Lorem ipsum dolor sit amet consectetur adipisicing elit. Id veniam totam enim debitis porro quas obcaecati, odio minus eius repudiandae neque corporis, magni, rem veritatis soluta labore. Voluptate, debitis sint?
          Nobis iure exercitationem assumenda nihil quisquam officiis consequuntur ipsam molestia.</p>
          
          <p className="p-5">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quibusdam laboriosam, ipsa perspiciatis quae rerum aperiam cumque repellendus eveniet minima commodi numquam quos laborum id eaque quia consequuntur, officia facere veniam?
          Consequatur in repellat eaque? Laboriosam amet corporis facere. Opti.</p>
           <b className="text-gray-800">Our Mission</b>
          <p className="p-5"> Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error asperiores, et voluptatibus, porro recusandae nam voluptatem consequuntur corporis mollitia dignissimos quidem magnam necessitatibus illo? Earum eum enim aspernatur similique placeat!</p>
          </div>
         
       </div>
        <div className="text-2xl py-4">
            <h1 className=" text-3xl sm:text-3xl   flex justify-center sm:mt-10 mt-8 font-bold  text-blue-900   text-wrap ">
             WHY <span className="text-red-500 ml-3"> CHOOSE US</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row text-sm mb-20">
             <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
              <b>Quality Assurence</b>
              <p className="text-gray-600">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi</p>
             </div>
             <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
              <b>Convinience:</b>
              <p className="text-gray-600">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi</p>
             </div>
             <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
              <b>Exceptional Customer service :</b>
              <p className="text-gray-600">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi</p>
             </div>
        </div>
        
    </div>

      

  )
}

export default About