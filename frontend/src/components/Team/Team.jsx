import React from "react";
import "./Team.css";

import {
  FaFacebookF,
  FaTelegramPlane,
  FaInstagram,
  FaLinkedinIn,
  FaGithub
} from "react-icons/fa";

const Team = () => {

  const teamMembers = [

    {
      name: "Shelema Ageri",
      role: "Frontend Developer",
      university: "Haramaya University",
      image: "/team/shelema.jpg",

      description:
        "Leads the frontend development and builds modern, responsive and user-friendly interfaces for the e-commerce platform.",

      social: {
        facebook: "https://facebook.com/",
        telegram: "https://t.me/",
        instagram: "https://instagram.com/",
        linkedin: "https://linkedin.com/",
        github: "https://github.com/"
      }
    },

    {
      name: "Gadisa Asefa",
      role: "Frontend Developer",
      university: "Haramaya University",
      image: "/team/gadisa.jpg",

      description:
        "Develops responsive user interfaces and helps create a smooth and engaging shopping experience for customers.",

      social: {
        facebook: "https://facebook.com/",
        telegram: "https://t.me/",
        instagram: "https://instagram.com/",
        linkedin: "https://linkedin.com/",
        github: "https://github.com/"
      }
    },

    {
      name: "Obsa Tesfaye",
      role: "Backend Developer",
      university: "Haramaya University",
      image: "/team/obsa.jpg",

      description:
        "Develops secure backend services, APIs and database functionality that power the e-commerce platform.",

      social: {
        facebook: "https://facebook.com/",
        telegram: "https://t.me/",
        instagram: "https://instagram.com/",
        linkedin: "https://linkedin.com/",
        github: "https://github.com/"
      }
    },

    {
      name: "Fikiru",
      role: "Backend Developer",
      university: "Bonga University",
      image: "/team/fikiru.jpg",

      description:
        "Works on backend services, API integration and database systems to ensure reliable platform functionality.",

      social: {
        facebook: "https://facebook.com/",
        telegram: "https://t.me/",
        instagram: "https://instagram.com/",
        linkedin: "https://linkedin.com/",
        github: "https://github.com/"
      }
    }

  ];


  return (

    <section className="team-section" id="team">

      <div className="team-header">

        <span className="team-subtitle">
          OUR TEAM
        </span>

        <h2>
          Meet Our <span>Development Team</span>
        </h2>

        <p>
          Meet the talented developers behind our Tech & Electronics
          E-Commerce Platform. Our team combines frontend and backend
          expertise to create a modern, secure and user-friendly
          shopping experience.
        </p>

      </div>


      <div className="team-container">

        {teamMembers.map((member, index) => (

          <div className="team-card" key={index}>

            {/* Profile Image */}

            <div className="team-image-container">

              <img
                src={member.image}
                alt={member.name}
                className="team-image"
              />

            </div>


            {/* Member Information */}

            <div className="team-info">

              <h3>
                {member.name}
              </h3>

              <h4>
                {member.role}
              </h4>

              <div className="team-university">

                🎓 {member.university}

              </div>

              <p>
                {member.description}
              </p>


              {/* Social Media */}

              <div className="team-social">

                <a
                  href={member.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} Facebook`}
                >
                  <FaFacebookF />
                </a>


                <a
                  href={member.social.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} Telegram`}
                >
                  <FaTelegramPlane />
                </a>


                <a
                  href={member.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} Instagram`}
                >
                  <FaInstagram />
                </a>


                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} LinkedIn`}
                >
                  <FaLinkedinIn />
                </a>


                <a
                  href={member.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} GitHub`}
                >
                  <FaGithub />
                </a>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>

  );

};

export default Team;