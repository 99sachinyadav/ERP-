 

import { about, } from "../assets/assets"
 
 

 
const About = () => {
  return (
    <div className="bg-white min-h-screen px-4 sm:px-8">
      <div className="text-center pt-8 border-t">
        <h1 className="text-3xl sm:text-6xl font-bold text-blue-900 flex justify-center items-center flex-wrap gap-2">
          About <span className="text-red-500">Us</span>
        </h1>
      </div>
      <div className="flex flex-col md:flex-row items-center my-8 gap-10 md:gap-20">
        <img
          src={about}
          className="w-full md:max-w-[500px] rounded-xl shadow-lg object-cover"
          alt="About Us"
        />
        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-700">
          <p className="p-4 rounded-lg bg-gray-50 shadow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Id veniam totam enim debitis porro quas obcaecati, odio minus eius repudiandae neque corporis, magni, rem veritatis soluta labore. Voluptate, debitis sint? Nobis iure exercitationem assumenda nihil quisquam officiis consequuntur ipsam molestia.
          </p>
          <p className="p-4 rounded-lg bg-gray-50 shadow">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quibusdam laboriosam, ipsa perspiciatis quae rerum aperiam cumque repellendus eveniet minima commodi numquam quos laborum id eaque quia consequuntur, officia facere veniam? Consequatur in repellat eaque? Laboriosam amet corporis facere. Opti.
          </p>
          <b className="text-gray-800 text-lg mt-2">Our Mission</b>
          <p className="p-4 rounded-lg bg-gray-50 shadow">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Error asperiores, et voluptatibus, porro recusandae nam voluptatem consequuntur corporis mollitia dignissimos quidem magnam necessitatibus illo? Earum eum enim aspernatur similique placeat!
          </p>
        </div>
      </div>
      <div className="text-center py-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-blue-900 flex justify-center items-center flex-wrap gap-2">
          WHY <span className="text-red-500">CHOOSE US</span>
        </h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-20">
        <div className="border rounded-xl px-8 py-8 flex-1 bg-gradient-to-br from-blue-50 to-white shadow hover:shadow-lg transition">
          <b className="text-blue-800 text-lg">Quality Assurance</b>
          <p className="text-gray-600 mt-2">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi
          </p>
        </div>
        <div className="border rounded-xl px-8 py-8 flex-1 bg-gradient-to-br from-red-50 to-white shadow hover:shadow-lg transition">
          <b className="text-red-800 text-lg">Convenience</b>
          <p className="text-gray-600 mt-2">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi
          </p>
        </div>
        <div className="border rounded-xl px-8 py-8 flex-1 bg-gradient-to-br from-yellow-50 to-white shadow hover:shadow-lg transition">
          <b className="text-yellow-800 text-lg">Exceptional Customer Service</b>
          <p className="text-gray-600 mt-2">
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illo molestias, aliquam repellat laborum odit in ducimus perferendis quod nihi
          </p>
        </div>
      </div>
    </div>
  )
}

export default About