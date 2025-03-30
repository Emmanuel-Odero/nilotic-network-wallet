import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Globe from "react-globe.gl";
import { useRef, useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const globeEl = useRef<any>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  // Tokenomics Pie Chart Data
  const tokenomicsData = {
    labels: ["Pre-Mined (35%)", "Staking Rewards (60%)", "Reserved/Burned (5%)"],
    datasets: [
      {
        data: [194.25, 333, 27.75], // In millions SLW
        backgroundColor: ["#3B82F6", "#10B981", "#EF4444"],
        borderColor: ["#fff"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-gray-100 dark:bg-gradient-to-b dark:from-gray-900 dark:to-black text-gray-900 dark:text-white overflow-x-hidden">
      {/* Hero Section with 3D Globe */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative min-h-screen flex flex-col justify-center items-center text-center pt-24 pb-16"
      >
        <div className="absolute inset-0 z-0">
          {isMounted && (
            <Globe
              ref={globeEl}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
              backgroundColor="rgba(0,0,0,0)"
              width={window.innerWidth}
              height={window.innerHeight}
              arcsData={[
                { startLat: 1.35, startLng: 32.29, endLat: 15.5, endLng: 32.58, color: "#3B82F6" }, // Nile River path
              ]}
              arcColor="color"
              arcDashLength={0.9}
              arcDashGap={4}
              arcDashAnimateTime={1500}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/80 to-teal-500/80 mix-blend-overlay" />
        </div>
        <motion.h1
          variants={itemVariants}
          className="relative z-10 text-6xl md:text-8xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
        >
          Nilotic Wallet
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="relative z-10 text-xl md:text-3xl mb-8 max-w-3xl px-4 font-light"
        >
          Unleash the power of Sulwe (SLW) on the Nilotic Network—your secure, futuristic crypto companion.
        </motion.p>
        <motion.div variants={itemVariants} className="relative z-10">
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white/90 dark:bg-blue-600/90 text-blue-600 dark:text-white font-semibold rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all duration-300 ease-in-out backdrop-blur-md"
          >
            Embark Now
          </Link>
        </motion.div>
      </motion.section>

      {/* Features Section with Interactive Cards */}
      <section className="py-20 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-center mb-12 text-blue-600 dark:text-blue-400"
          >
            Why Nilotic Wallet?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Multi-Wallet Mastery",
                desc: "Craft unique wallets—Genesis, Travel, or custom—for every need, secured with RSA encryption.",
                icon: "🔐",
              },
              {
                title: "Seamless Email Payments",
                desc: "Send SLW to any email—natives get it instantly, aliens claim via escrow.",
                icon: "✉️",
              },
              {
                title: "Stake & Govern",
                desc: "Stake SLW to earn 5 SLW per block and vote on the network’s future.",
                icon: "⚖️",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-white/80 dark:bg-gray-800/80 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-md border border-gray-200 dark:border-gray-700"
              >
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tokenomics Section with Pie Chart */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-center mb-12"
          >
            Sulwe (SLW) Tokenomics
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Sulwe (“star” in Swahili) powers the Nilotic Network with a total supply of <strong>555 million SLW</strong>. Here’s how it’s distributed:
              </p>
              <ul className="space-y-4 text-lg text-gray-600 dark:text-gray-300">
                <li>
                  <strong>35% Pre-Mined:</strong> 194.25M SLW for founders, early adopters, and ecosystem initiatives.
                </li>
                <li>
                  <strong>60% Staking Rewards:</strong> 333M SLW, awarded at 5 SLW per block, halving over time.
                </li>
                <li>
                  <strong>5% Reserved/Burned:</strong> 27.75M SLW for future use or deflationary burning.
                </li>
              </ul>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-6">
                Divisible into <strong>10^8 Lut</strong>, SLW supports microtransactions down to 0.00000001 SLW.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-sm mx-auto"
            >
              <Pie data={tokenomicsData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Network Architecture with Parallax */}
      <section className="py-20 px-4 md:px-8 relative">
        <div
          className="absolute inset-0 bg-fixed bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080?nile-river')" }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-center mb-12 text-blue-600 dark:text-blue-400"
          >
            The Nilotic Network Unveiled
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            A hybrid Proof-of-Stake blockchain crafted in C++ for speed and resilience, inspired by the Nile’s enduring flow.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Staking", desc: "Earn 5 SLW per block by validating the network." },
              { title: "Governance", desc: "Shape the future with DAO proposals and votes." },
              { title: "Smart Contracts", desc: "Build dApps with limitless potential." },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="p-6 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg backdrop-blur-md"
              >
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-500 text-white text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-6"
        >
          Join the Nilotic Revolution
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl mb-8 max-w-lg mx-auto"
        >
          Step into a decentralized future with SLW and Nilotic Wallet.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            to="/register"
            className="inline-block px-10 py-4 bg-white text-blue-600 font-semibold rounded-full shadow-xl hover:bg-blue-50 hover:scale-110 transition-all duration-300 ease-in-out"
          >
            Start Your Journey
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900 text-white text-center">
        <p className="text-sm">© 2025 Nilotic Wallet | Powered by Nilotic Network</p>
        <div className="mt-4 space-x-4">
          <Link to="/about" className="text-blue-400 hover:underline">About</Link>
          <Link to="/get-started" className="text-blue-400 hover:underline">Get Started</Link>
          <a href="mailto:support@nilotic.network" className="text-blue-400 hover:underline">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;