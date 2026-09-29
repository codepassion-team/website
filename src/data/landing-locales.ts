import * as base from "./landing";
import type { Locale } from "./landing-ui";

const thaiDescription =
  "เราออกแบบและพัฒนาซอฟต์แวร์สำหรับธุรกิจ ตั้งแต่วางสถาปัตยกรรมจนถึงเชื่อมต่อกับระบบที่คุณใช้อยู่";
const thai = {
  company: { ...base.company, description: thaiDescription },
  chapters: base.chapters.map((chapter, index) => ({
    ...chapter,
    ...[
      {
        eyebrow: "พัฒนาซอฟต์แวร์และออกแบบระบบ",
        lines: ["ซอฟต์แวร์", "ตามวิธีทำงาน", "ของคุณ"],
        mobileLines: ["ซอฟต์แวร์", "ที่เข้ากับงานคุณ"],
        description:
          "ออกแบบและพัฒนาระบบให้เข้ากับงานของคุณ เชื่อมเครื่องมือ ข้อมูล และ AI ให้ทำงานร่วมกัน",
        action: "คุยเรื่องระบบของคุณ",
      },
      {
        eyebrow: "01 / AI AGENT",
        lines: ["AI Agent ที่ทำงาน", "ร่วมกับระบบคุณ"],
        mobileLines: ["AI Agent ที่ทำงาน", "ร่วมกับระบบคุณ"],
        description:
          "เชื่อม AI Agent เข้ากับเครื่องมือและข้อมูลธุรกิจ โดยกำหนดงาน สิทธิ์การเข้าถึง และจุดที่ต้องให้คนตรวจสอบ",
        action: "คุยเรื่องการนำ AI มาใช้",
        details: ["เชื่อมเครื่องมือ", "ทำงานตามโจทย์", "ให้คนตรวจสอบ"],
      },
      {
        eyebrow: "02 / APPLICATION",
        lines: ["แอปที่ตรงกับ", "งานของคุณ"],
        mobileLines: ["แอปที่ตรงกับ", "งานของคุณ"],
        description:
          "พัฒนาเว็บแอปและเครื่องมือธุรกิจ ให้ทีมงานและลูกค้าทำสิ่งที่ต้องการได้สะดวก",
        action: "รู้จักความเชี่ยวชาญของเรา",
        details: ["เว็บแอปพลิเคชัน", "เครื่องมือธุรกิจ", "ประสบการณ์ผู้ใช้"],
      },
      {
        eyebrow: "03 / WORKFLOW AUTOMATION",
        lines: ["เชื่อมขั้นตอน", "ลดงานซ้ำ"],
        mobileLines: ["เชื่อมขั้นตอน", "ลดงานซ้ำ"],
        description:
          "เชื่อมการทำงานผ่าน API และเวิร์กโฟลว์ ตั้งแต่รับคำขอจนถึงส่งต่องานเข้าระบบถัดไป",
        action: "รู้จักความเชี่ยวชาญของเรา",
        details: ["API", "เวิร์กโฟลว์", "เชื่อมต่อระบบ"],
      },
      {
        eyebrow: "04 / DATA TRANSFORMATION",
        lines: ["จัดข้อมูลให้", "ใช้ร่วมกันได้"],
        mobileLines: ["จัดข้อมูลให้", "ใช้ร่วมกันได้"],
        description:
          "จับคู่ฟิลด์ ตรวจสอบ และแปลงรูปแบบข้อมูลจากหลายแหล่ง ให้ระบบปลายทางนำไปใช้ต่อได้",
        action: "รู้จักความเชี่ยวชาญของเรา",
        details: ["จับคู่ฟิลด์", "ตรวจสอบข้อมูล", "ส่งต่อข้อมูล"],
      },
      {
        eyebrow: "05 / INFRASTRUCTURE",
        lines: ["วางฐานให้ระบบ", "ทำงานต่อได้"],
        mobileLines: ["วางฐานให้ระบบ", "ทำงานต่อได้"],
        description:
          "วางโครงสร้างคลาวด์ การนำระบบขึ้นใช้งาน และการติดตามสถานะ ให้เหมาะกับการทำงานและดูแลระบบ",
        action: "คุยเรื่องระบบของคุณ",
        details: ["คลาวด์", "นำระบบขึ้นใช้งาน", "ติดตามสถานะ"],
      },
    ][index],
  })),
  services: base.services.map((service, index) => ({
    ...service,
    ...[
      {
        title: "วางสถาปัตยกรรมระบบ",
        category: "สถาปัตยกรรมโซลูชัน",
        description:
          "เราช่วยตัดสินใจด้านสถาปัตยกรรมตั้งแต่ต้น และแปลงความต้องการของธุรกิจเป็นแผนพัฒนาระบบ",
        details: [
          "ออกแบบระบบ",
          "วางแผนสถาปัตยกรรม",
          "คลาวด์และโครงสร้างพื้นฐาน",
        ],
      },
      {
        title: "พัฒนาซอฟต์แวร์",
        category: "พัฒนาซอฟต์แวร์",
        description:
          "เราพัฒนาเว็บแอปพลิเคชันและแพลตฟอร์มองค์กร โดยออกแบบให้เหมาะกับผู้ใช้งาน",
        details: ["เว็บแอปพลิเคชัน", "แพลตฟอร์มองค์กร", "ออกแบบ UX และหน้าจอ"],
      },
      {
        title: "เชื่อมต่อระบบ",
        category: "เชื่อมต่อระบบ",
        description:
          "เราเชื่อมแอปพลิเคชัน ข้อมูล และขั้นตอนการทำงานผ่าน API และระบบอัตโนมัติ",
        details: [
          "API และการเชื่อมต่อ",
          "โซลูชันธุรกิจบน LINE",
          "ข้อมูลและระบบอัตโนมัติ",
        ],
      },
    ][index],
  })),
  products: base.products.map((product, index) => ({
    ...product,
    ...[
      {
        category: "สร้างเว็บไซต์ด้วย AI",
        description: "เครื่องมือสร้างเว็บไซต์สำหรับธุรกิจด้วย AI",
        action: "รู้จัก Sekweb",
      },
      {
        category: "จัดการสมาชิก",
        description: "แพลตฟอร์มจัดการสมาชิกผ่าน LINE OA",
        action: "สอบถามเกี่ยวกับ MemberConnex",
      },
      {
        category: "ผลิตภัณฑ์จาก CodePassion",
        description:
          "ติดต่อทีมเพื่อดูรายละเอียด Workery และคุยกันว่าเหมาะกับธุรกิจของคุณหรือไม่",
        action: "สอบถามเกี่ยวกับ Workery",
      },
      {
        category: "Software Architecture Framework",
        description:
          "เฟรมเวิร์กสถาปัตยกรรมซอฟต์แวร์สำหรับออกแบบและพัฒนาแอปพลิเคชันธุรกิจ",
        action: "รู้จัก WorkEngine",
      },
    ][index],
  })),
  projects: base.projects.map((project) => ({
    ...project,
    category: (
      {
        Corporate: "องค์กร",
        Jewelry: "เครื่องประดับ",
        Property: "อสังหาริมทรัพย์",
        Exhibition: "งานแสดงสินค้า",
        Hospital: "โรงพยาบาล",
      } as Record<string, string>
    )[project.category],
  })),
  courses: base.courses.map((course, index) => ({
    ...course,
    ...[
      {
        audience: "สำหรับผู้บริหารและเจ้าของธุรกิจ",
        summary:
          "นำ AI มาใช้กับธุรกิจ เรียนรู้กระบวนการทำงานที่ใช้ได้จริง พร้อมสร้าง Agent ที่นำไปต่อยอดหลังจบคลาส",
      },
      {
        audience: "สำหรับนักพัฒนา",
        summary:
          "ใช้ Claude Code ตลอดกระบวนการพัฒนาซอฟต์แวร์ ตั้งแต่วางแผนและจัดการบริบทโปรเจกต์ ไปจนถึงทดสอบและส่งมอบ",
      },
      {
        audience: "สำหรับนักพัฒนา",
        summary:
          "สร้างกระบวนการพัฒนาด้วย Codex ครอบคลุมคำสั่งประจำโปรเจกต์ ขอบเขต Sandbox และนโยบายการอนุมัติ",
      },
      {
        audience: "สำหรับนักพัฒนาและ Tech Lead",
        summary:
          "เข้าใจหลักการทำงานของ Coding Agent และเลือกกระบวนการที่เหมาะกับทีมและเครื่องมือของคุณ",
      },
    ][index],
  })),
  certificates: base.certificates.map((certificate, index) => ({
    ...certificate,
    detail: ["กระบวนการวิศวกรรมซอฟต์แวร์", "มาตรฐานการเข้าถึงเว็บไซต์"][index],
  })),
  technologyLayers: base.technologyLayers.map((layer, index) => ({
    ...layer,
    description: [
      "คลาวด์ การติดตั้ง และโฮสติ้ง",
      "เฟรมเวิร์กและการเชื่อมต่อ API",
      "ระบบและแอปพลิเคชัน",
      "การจัดเก็บและเข้าถึงข้อมูล",
    ][index],
  })),
};

/** Both routes render complete HTML. Brand and official course names stay unchanged. */
export function getLandingContent(locale: Locale) {
  return locale === "th" ? { ...base, ...thai } : base;
}
