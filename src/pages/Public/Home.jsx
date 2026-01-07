 import Navbar from "../../components/Home/Navbar";
 import Footer from '../../components/Home/Footer';
 import Hero  from  "../../components/Home/Hero";
 import Why from '../../components/Home/Why';
 import Who from '../../components/Home/Who';
 import Work from "../../components/Home/Work";

export default function Home(){
    return(
        <div className="flex flex-col">
            <Navbar/>
            <Hero/>
            <Work/>
            <Why/>
            <Who/>
            <Footer/>
        </div>
    )
}