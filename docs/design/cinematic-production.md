# Visual story and media production note

| Scene | Visual story | Website copy |
| --- | --- | --- |
| 01 — Full stack | Five intact layers appear at the right of the opening; scrolling moves the stack to the center. | Software built around your business / ซอฟต์แวร์ ตามวิธีทำงานของคุณ. Talk about your project. |
| 02 — AI Agent | The top layer expands in place and reveals a connected chip. | AI agents for your workflows / AI Agent ที่ทำงานร่วมกับระบบคุณ. |
| 03 — Application | The app surface expands and the explanation moves to the right. | Built around your work / แอปที่ตรงกับงานของคุณ. |
| 04 — Workflow Automation | Connected nodes reveal the sequence of work. | Connect steps. Cut repeat work / เชื่อมขั้นตอน ลดงานซ้ำ. |
| 05 — Data Transformation | Inputs and outputs become a shared format. | Different sources. Usable data / จัดข้อมูลให้ใช้ร่วมกันได้. |
| 06 — Infrastructure | The foundation expands while the other layers dim. | A foundation you can build on / วางฐานให้ระบบทำงานต่อได้. Talk about your system. |

Each layer remains in the same stack and expands without crossing its neighbors. The visual and HTML chapter use the same scroll position. Arrows connect the readable label to the active slab; the copy alternates left and right on desktop and sits below the graphic on mobile. Previous/Next moves to the midpoint of each reading hold and normal scrolling can reverse the sequence.

Desktop active travel is approximately 6.4 viewport heights, mobile approximately 4.4, plus the visible stage. The desktop reading holds are 0–7%, 17–24%, 35–42%, 53–60%, 71–78% and 91–100%; mobile holds are slightly shorter. The gaps between holds handle center movement and in-place expansion. The timeline is defined in `src/scripts/story-timeline.ts`.

The current media is a deterministic canvas illustration, drawn separately for landscape and portrait dimensions. There are no generated clips or frame manifests. Higgsfield image/video/model-schema/job tools were unavailable in this project session, so no generation provider was substituted. If those tools become available, any future generated video should follow these six states and preserve slab geometry, palette, lighting, and matching handoff frames. The HTML copy and controls must stay editable and accessible above any footage.
