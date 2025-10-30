import { Button } from "../components/UI/new-button";
//@ts-ignore
import landingImage from "../assets/landing_img.png";

const HomePage = () => {
  return (
    // <div className="w-full h-screen flex flex-col md:flex-row">
    //   <div className="flex-1 h-1/2 md:h-full bg-white flex items-center justify-center">
    //     <Button
    //       asLink
    //       to="/login"
    //       className="bg-primary-blue text-white min-w-[300px]"
    //     >
    //       Login
    //     </Button>
    //   </div>
    // </div>
    <div className="bg-gradient-to-b from-primary-vividBlueBg to-background" id="home">
      <div className="overflow-clip pt-28 xl:pt-0">
        <div className="mx-auto grid grid-cols-12 items-center gap-2 md:gap-16 md:px-10 xl:w-[1280px] xl:px-2">
          <div className="col-span-12 px-4 md:col-span-7 md:px-0">
            <h1 className="text-jump-gradient mb-8 break-words text-5xl font-light tracking-[-0.02em] lg:leading-20 lg:text-7xl">
              Enterprise-Ready Solutions for Modern Businesses
            </h1>
            <div className="mb-10 text-lg font-light lg:text-3xl">
              <p>
                Custom enterprise HR and insurance systems with flexible
                deployment options to power your business
              </p>
            </div>
            <div className="flex items-start gap-4">
              <Button
                size="lg"
                asLink
                to="/login"
                data-discover="true"
                className="min-w-[300px]"
              >
                Login
              </Button>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5">
            <figure className="md:-mr-30">
              <img
                alt=""
                className="w-full"
                sizes="100vw"
                loading="lazy"
                decoding="async"
                src={landingImage}
              />
            </figure>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
