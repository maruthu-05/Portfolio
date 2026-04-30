const fallbackProfile = {
  name: "Your Name",
  summary:
    "A focused builder creating thoughtful web experiences, practical tools, and polished digital products.",
  about:
    "This portfolio is structured to highlight your story, your projects, and the fastest path to contact you.",
  focus: "Building a strong personal brand online",
  location: "Open to opportunities",
  email: "your@email.com",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/in/",
  resume: "myres.pdf",
  skills: ["JavaScript", "HTML", "CSS", "React", "Node.js", "Git"],
  projects: [
    {
      title: "Portfolio website",
      description: "A clean personal site that presents your profile, work, and contact links.",
    },
    {
      title: "Resume showcase",
      description: "A one-page layout that makes it easy for recruiters to scan your experience.",
    },
    {
      title: "Linked profile hub",
      description: "A central landing page for your public links and downloadable resume.",
    },
  ],
};

function normalizeGithub(value) {
  if (!value) {
    return fallbackProfile.github;
  }
  return value.startsWith("http") ? value : `https://github.com/${value.replace(/^@/, "")}`;
}

function normalizeLinkedIn(value) {
  if (!value) {
    return fallbackProfile.linkedin;
  }
  return value.startsWith("http") ? value : `https://linkedin.com/in/${value.replace(/^@/, "")}`;
}

function isPlaceholderValue(value) {
  if (!value) {
    return true;
  }
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("your-") || normalized.includes("placeholder") || normalized === "resume.pdf";
}

function parseLinksText(text) {
  const result = {};
  const extras = [];
  let currentSection = "";
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (line.toLowerCase().includes("platform") && line.endsWith(":")) {
        currentSection = line.toLowerCase();
        return;
      }

      if (line.startsWith("http://") || line.startsWith("https://")) {
        extras.push({ href: line, group: currentSection });
        return;
      }

      const separatorIndex = line.indexOf("=") >= 0 ? line.indexOf("=") : line.indexOf(":");
      if (separatorIndex === -1) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();
      if (key && value) {
        result[key] = value;
      } else if (value.startsWith("http")) {
        extras.push({ href: value, group: key });
      }
    });

  return { fields: result, extras };
}

async function loadTextFile(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${path} not found`);
  }
  return response.text();
}

async function loadProfile() {
  let profile = { ...fallbackProfile };

  try {
    const response = await fetch("profile.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("profile.json not found");
    }
    profile = {
      ...profile,
      ...(await response.json()),
    };
  } catch {
    // Keep the fallback profile if profile.json is missing.
  }

  try {
    const linksText = await loadTextFile("links.txt");
    const parsed = parseLinksText(linksText);
    const githubUrl = parsed.extras.find((item) => item.href.includes("github.com"))?.href;
    const linkedinUrl = parsed.extras.find((item) => item.href.includes("linkedin.com"))?.href;
    profile = {
      ...profile,
      name: parsed.fields.name || profile.name,
      email: parsed.fields.email || profile.email,
      github: githubUrl ? normalizeGithub(githubUrl) : !isPlaceholderValue(parsed.fields.github) ? normalizeGithub(parsed.fields.github) : profile.github,
      linkedin: linkedinUrl ? normalizeLinkedIn(linkedinUrl) : !isPlaceholderValue(parsed.fields.linkedin) ? normalizeLinkedIn(parsed.fields.linkedin) : profile.linkedin,
      resume: parsed.fields.resume && !isPlaceholderValue(parsed.fields.resume) ? parsed.fields.resume : "myres.pdf",
    };
  } catch {
    // links.txt is optional.
  }

  return {
    ...profile,
    github: normalizeGithub(profile.github),
    linkedin: normalizeLinkedIn(profile.linkedin),
  };
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

function setLink(id, href, label) {
  const element = document.getElementById(id);
  if (element) {
    element.href = href;
    if (label) {
      element.textContent = label;
    }
  }
}

function renderSkills(skills) {
  const list = document.getElementById("skills-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  skills.forEach((skill) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = skill;
    list.appendChild(chip);
  });
}

function renderProjects(projects) {
  const list = document.getElementById("projects-list");
  if (!list) {
    return;
  }
  list.innerHTML = "";
  projects.forEach((project) => {
    const item = document.createElement("article");
    item.className = "project-item";

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    item.append(title, description);
    list.appendChild(item);
  });
}

function renderEducation(education) {
  const section = document.getElementById("education-section");
  if (!section || !education) {
    return;
  }
  const content = `
    <p class="section-label">Education</p>
    <h2>${education.school}</h2>
    <p><strong>${education.degree}</strong></p>
    <p class="education-meta">${education.duration} • GPA: ${education.gpa}</p>
  `;
  section.innerHTML = content;
}

function renderCertificationsAndAchievements(certs, achievements) {
  const certSection = document.getElementById("certifications-section");
  const achieveSection = document.getElementById("achievements-section");

  if (certSection && certs && certs.length > 0) {
    const certItems = certs.map((cert) => `<li>${cert}</li>`).join("");
    certSection.innerHTML = `
      <p class="section-label">Certifications</p>
      <h2>Professional Development</h2>
      <ul class="list-items">${certItems}</ul>
    `;
  }

  if (achieveSection && achievements && achievements.length > 0) {
    const achieveItems = achievements.map((achieve) => `<li>${achieve}</li>`).join("");
    achieveSection.innerHTML = `
      <p class="section-label">Achievements</p>
      <h2>Recognition & Awards</h2>
      <ul class="list-items">${achieveItems}</ul>
    `;
  }
}

function platformLabelFromUrl(url) {
  if (url.includes("leetcode.com")) {
    return "LeetCode";
  }
  if (url.includes("codeforces.com")) {
    return "Codeforces";
  }
  if (url.includes("codechef.com")) {
    return "CodeChef";
  }
  if (url.includes("github.com")) {
    return "GitHub";
  }
  if (url.includes("linkedin.com")) {
    return "LinkedIn";
  }
  return "Profile";
}

function renderProfiles(urls) {
  const list = document.getElementById("profiles-list");
  if (!list) {
    return;
  }

  list.innerHTML = "";
  urls.forEach((url) => {
    const card = document.createElement("a");
    card.className = "link-card";
    card.href = url;
    card.target = "_blank";
    card.rel = "noreferrer";

    const title = document.createElement("span");
    title.className = "link-card-title";
    title.textContent = platformLabelFromUrl(url);

    const value = document.createElement("span");
    value.className = "link-card-value";
    value.textContent = url;

    card.append(title, value);
    list.appendChild(card);
  });
}

async function main() {
  const profile = await loadProfile();

  setText("hero-name", profile.name);
  setText("hero-summary", profile.summary);
  setText("about-text", profile.about);
  setText("focus-value", profile.focus);
  setText("location-value", profile.location);
  setText("contact-text", profile.contact || profile.summary);
  setText("email-link", profile.email);
  setText("projects-count", String(profile.projects.length).padStart(2, "0"));

  setLink("github-link", profile.github, "GitHub");
  setLink("linkedin-link", profile.linkedin, "LinkedIn");
  setLink("resume-link", profile.resume, "Resume");
  setLink("portfolio-link", profile.resume, "Download resume");
  setLink("email-link", `mailto:${profile.email}`, profile.email);

  renderSkills(profile.skills);
  renderProjects(profile.projects);
  renderEducation(profile.education);
  renderCertificationsAndAchievements(profile.certifications, profile.achievements);

  try {
    const linksText = await loadTextFile("links.txt");
    const parsed = parseLinksText(linksText);
    const profileUrls = new Set([profile.github, profile.linkedin]);
    parsed.extras.forEach((item) => profileUrls.add(item.href));
    renderProfiles(Array.from(profileUrls).filter(Boolean));
  } catch {
    renderProfiles([profile.github, profile.linkedin].filter(Boolean));
  }
}

main();
