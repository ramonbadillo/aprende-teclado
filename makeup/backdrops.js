(() => {
  'use strict';

  const panel = '<rect x="19" y="19" width="682" height="395" rx="11"/>';

  function cloud(x, y, scale = 1) {
    return `<path transform="translate(${x} ${y}) scale(${scale})" d="M0 16Q0 8 11 8Q13-2 23 0Q33-14 44-3Q54-4 58 6Q70 4 75 13Q79 19 68 20H10Q0 20 0 16Z" fill="#fff9e7" opacity=".84"/>`;
  }

  function pine(x, ground, scale, green, tint) {
    return `<g transform="translate(${x} ${ground}) scale(${scale})">
      <path d="M-4-18H4L5 4H-5Z" fill="#846d61"/>
      <path d="M0-106L-16-77L-9-79L-26-53L-16-56L-35-27L-21-30L-44-8Q0 6 44-8L22-30L34-28L16-55L26-52L9-80L16-77Z" fill="${green}"/>
      <path d="M0-101L-10-80L-5-81L-17-58L-8-61L-24-34L-12-38L-28-16Q-14-13-1-18L4-29L-2-27L5-49L0-47L4-68L0-66Z" fill="${tint}"/>
    </g>`;
  }

  function flowers(x, y, scale, color) {
    return `<g transform="translate(${x} ${y}) scale(${scale})">
      <path d="M-2 1C-14 0-12-9-5-8Q-6-17 1-15Q7-15 6-8C16-12 18-2 9 1C18 7 13 14 5 9C4 19-6 17-6 8Q-16 11-15 4Q-14 0-2 1Z" fill="${color}"/>
      <circle r="3.6" fill="#f3c46f"/><circle cx="-1" cy="-1" r="1" fill="#fff6d7"/>
    </g>`;
  }

  function spark(x, y, size = 1) {
    return `<path transform="translate(${x} ${y}) scale(${size})" d="M0-8Q1-1 7 0Q1 1 0 8Q-1 1-7 0Q-1-1 0-8Z"/>`;
  }

  function studio(id) {
    return `<defs><radialGradient id="${id}-light"><stop stop-color="#fff3d8"/><stop offset="1" stop-color="#fff3d8" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="362" cy="217" rx="332" ry="193" fill="url(#${id}-light)"/>
      <path d="M19 369Q359 352 701 369V414H19Z" fill="#e5bdb1"/>
      <path d="M19 369Q359 352 701 369" fill="none" stroke="#dbaea7" stroke-width="1.5"/>
      <g opacity=".92"><g fill="#fff2ca" stroke="#c38c70" stroke-width=".9">
        ${spark(51, 71)}${spark(238, 102)}${spark(465, 75)}${spark(666, 61)}
      </g><g fill="#c38c70"><circle cx="63" cy="64" r="1.7"/><circle cx="244" cy="92" r="1.4"/><circle cx="475" cy="65" r="1.5"/><circle cx="658" cy="71" r="1.7"/></g></g>`;
  }

  function garden(id) {
    return `<defs><pattern id="${id}-pickets" width="28" height="75" patternUnits="userSpaceOnUse" x="21" y="215">
        <path d="M3 14L10 4L17 14V75H3Z" fill="#f7e5c7" stroke="#d8c3a0" stroke-width="1.6"/></pattern></defs>
      ${cloud(175, 70, .82)}${cloud(493, 97, .61)}
      <path d="M15 238Q93 177 174 209Q236 181 292 221Q365 187 438 219Q516 176 584 207Q656 170 710 204V331H15Z" fill="#b8cf9f"/>
      <path d="M18 239H702V247H18ZM18 260H702V267H18Z" fill="#dfcca8"/>
      <rect x="19" y="215" width="682" height="75" fill="url(#${id}-pickets)"/>
      <path d="M15 291Q36 265 61 272Q81 242 110 261Q134 242 157 263Q184 253 211 281Q234 266 257 280Q288 249 322 276Q351 257 387 278Q417 252 442 272Q479 251 502 269Q534 236 563 259Q590 232 617 255Q656 231 683 265Q697 254 708 264V345H15Z" fill="#95b785"/>
      <path d="M15 319Q135 282 254 309Q369 332 472 309Q605 275 705 296V417H15Z" fill="#c8d8a6"/>
      <path d="M19 362Q111 344 197 352M460 365Q564 344 674 345" fill="none" stroke="#b2c68d" stroke-width="2.6"/>
      <g stroke="#788e71" stroke-width="3" fill="#b3b98a">
        <path d="M27 285V129Q29 72 81 34Q145 1 236 12L231 23Q150 10 93 43Q39 75 37 134V285Z"/>
        <path d="M681 284V131Q679 81 633 46Q582 12 513 18L511 10Q588 0 641 37Q692 70 692 129V284Z"/>
      </g>
      <g fill="#699b78"><path d="M22 178Q49 166 47 149Q28 154 22 178ZM34 130Q50 128 62 109Q42 107 34 130ZM42 101Q46 84 36 71Q31 90 42 101ZM63 71Q84 71 91 55Q74 53 63 71ZM108 35Q116 54 135 49Q126 36 108 35ZM149 26Q167 40 183 30Q164 21 149 26ZM683 115Q655 107 651 87Q676 91 683 115ZM670 81Q673 60 685 53Q684 74 670 81ZM642 52Q624 68 609 63Q619 48 642 52ZM599 31Q579 46 568 37Q578 28 599 31Z"/></g>
      ${flowers(37, 137, .83, '#eda7aa')}${flowers(58, 80, 1.02, '#efb1af')}${flowers(78, 61, .64, '#ffd5b2')}${flowers(110, 37, .81, '#e99aa3')}
      ${flowers(617, 38, .83, '#f2a5ab')}${flowers(658, 67, .76, '#f6c29c')}${flowers(678, 95, .9, '#efa7b0')}
      <g fill="#75a077"><path d="M46 388Q39 374 27 376Q34 385 46 388ZM47 388Q44 367 58 359Q58 375 47 388ZM669 376Q674 360 687 360Q682 372 669 376Z"/></g>
      ${flowers(39, 379, .57, '#fff2c6')}${flowers(659, 375, .53, '#fff0cd')}`;
  }

  function beach() {
    return `<circle cx="476" cy="82" r="42" fill="#f8d38a"/><circle cx="476" cy="82" r="35" fill="#ffe6a8"/>
      ${cloud(123, 74, .92)}${cloud(305, 104, .67)}${cloud(512, 65, .65)}
      <g fill="none" stroke="#86a6a5" stroke-width="2.1"><path d="M418 90Q423 86 429 93Q435 86 441 89M448 81Q452 77 456 83Q460 78 465 80"/></g>
      <path d="M14 215Q139 212 233 216Q369 219 504 213Q615 210 707 214V347H14Z" fill="#81c9c6"/>
      <path d="M362 217Q405 204 442 207Q473 202 504 212Q540 207 564 216Z" fill="#9fc5ae"/>
      <path d="M14 258Q122 239 212 252Q320 266 427 247Q556 225 708 244V336H14Z" fill="#67b5bb"/>
      <path d="M9 284Q123 261 257 285Q358 304 482 274Q602 255 710 268V337H9Z" fill="#a8dbce"/>
      <path d="M13 310Q115 276 250 302Q321 316 401 307Q515 290 579 301Q644 312 710 292V418H13Z" fill="#f5d29c"/>
      <path d="M14 312Q112 279 246 304Q309 319 398 310Q512 293 581 304Q644 315 711 296" fill="none" stroke="#fff6d7" stroke-width="6"/>
      <g fill="none" stroke="#dbefe2" stroke-width="2.4"><path d="M53 236q22-6 43-2m14 0q13 1 21-1M304 240q28-3 49-1M531 258q25-7 57-4m11 0h12M167 269q17-3 36 0"/></g>
      <g transform="translate(249 210)" stroke="#8b806b" stroke-width="1.5"><path d="M-15 0H16L10 5H-9Z" fill="#a77362"/><path d="M1-35V0" fill="none"/><path d="M-1-33L-15-4H-1Z" fill="#fff1d0"/><path d="M4-26L16-4H4Z" fill="#dfa08a"/></g>
      <path d="M21 316C49 256 61 180 51 112Q51 105 57 105C75 175 66 264 43 318Z" fill="#ba956a" stroke="#997857" stroke-width="2.2"/>
      <g fill="none" stroke="#9f7d55" stroke-width="2.3"><path d="M39 270l14 3m-10-23 13 3m-8-23 11 2m-9-24 11 2m-10-23 10 2m-9-22 8 1"/></g>
      <g fill="#699f86" stroke="#5b8f7b" stroke-width="1.7"><path d="M57 110C34 69 4 68-16 76Q15 79 42 102Q12 92-9 115Q21 104 48 115Q16 129 12 167Q32 136 56 122Q65 153 55 187Q81 151 66 120Q101 132 118 171Q117 122 72 112Q111 99 142 121Q118 83 69 104Q90 65 124 56Q84 51 57 100Q50 66 24 53Q45 77 57 110Z"/></g>
      <path d="M52 110Q74 100 98 104M58 111Q43 101 31 94" fill="none" stroke="#a1c19a" stroke-width="2.2"/>
      <g transform="translate(654 373) rotate(-16)" fill="#e69c80" stroke="#bf826d" stroke-width="1.3"><path d="m0-13 4 8 10 1-7 6 1 10-8-5-8 5 2-10-8-6 10-2Z"/><circle r="1.4" fill="#ffe3b0" stroke="none"/></g>
      <g fill="#d8b382"><ellipse cx="41" cy="357" rx="3" ry="1.5"/><ellipse cx="60" cy="362" rx="2" ry="1.2"/><ellipse cx="671" cy="364" rx="2" ry="1.2"/></g>`;
  }

  function forest() {
    const distant = [[20, .95], [66, 1.18], [119, .81], [204, .66], [250, .93], [323, .64], [390, 1.01], [448, .72], [532, 1.17], [595, .79], [654, 1], [698, 1.17]];
    return `<circle cx="458" cy="90" r="31" fill="#f6ddb0"/>
      <path d="M10 198Q79 155 148 175Q245 110 323 159Q393 125 476 164Q559 129 631 166Q667 148 710 156V317H10Z" fill="#bdcfb8"/>
      ${distant.map(([x, size]) => pine(x, 265, size, '#a1bcaa', '#b1c9b5')).join('')}
      <path d="M12 267Q122 196 227 247Q313 269 404 235Q494 212 576 234Q659 191 710 221V334H12Z" fill="#88ac97"/>
      ${pine(48, 271, 1.59, '#6f9b87', '#8cb19b')}${pine(623, 275, 1.56, '#729e8b', '#8daf9b')}
      ${pine(684, 282, 2.07, '#588877', '#709b83')}${pine(18, 298, 2.28, '#568675', '#789e81')}
      <path d="M16 288Q92 258 177 279Q265 295 349 281Q479 255 572 279Q649 293 706 270V417H16Z" fill="#a5bf99"/>
      <path d="M391 278Q418 293 359 306Q272 328 305 351Q337 374 479 411H254Q183 372 214 345Q235 323 316 309Q381 297 376 280Z" fill="#dfcca5"/>
      <path d="M14 369Q52 347 98 350M523 351Q586 334 680 350" fill="none" stroke="#90ac85" stroke-width="2.4"/>
      <g fill="#6e9573"><path d="M28 379q0-16-9-24q12 2 15 18q1-16 10-23q-1 13-9 26Zm641-10q0-15-10-21q13 1 17 17q3-19 14-22q-4 15-15 26Z"/></g>
      <g transform="translate(48 356)"><path d="M-1-9q-5 14-2 20q5 3 9-1q0-8-3-19Z" fill="#f4deb4" stroke="#a28b68" stroke-width="1.4"/><path d="M-16-6q7-21 18-18q10 3 15 18q-13 5-33 0Z" fill="#ce8d79" stroke="#aa7162" stroke-width="1.5"/><g fill="#fff0cc"><circle cx="-5" cy="-13" r="2.3"/><circle cx="5" cy="-17" r="1.8"/><circle cx="10" cy="-10" r="1.4"/></g></g>`;
  }

  function turret(x, y, scale) {
    return `<g transform="translate(${x} ${y}) scale(${scale})" stroke-linejoin="round">
      <path d="M-18 6H18L21 101H-20Z" fill="#eac9b6" stroke="#b89fa0" stroke-width="1.7"/>
      <path d="M-22 5L0-39L23 5Z" fill="#ad92b3" stroke="#8b799c" stroke-width="1.8"/>
      <path d="M0-36L-11 3H-20Z" fill="#c2acca"/><path d="M-23 6H23" stroke="#8d7796" stroke-width="2.4"/>
      <path d="M0-38V-53Q10-56 15-52Q8-51 1-46" fill="#e19ca4" stroke="#aa7f88" stroke-width="1.3"/>
      <path d="M-4 36V25Q0 16 5 25V36Z" fill="#a393a7"/>
      <path d="M-14 49h8m12 20h8m-27 10h5" stroke="#ccb0ac" stroke-width="1.6"/>
    </g>`;
  }

  function castle() {
    return `${cloud(55, 84, .86)}${cloud(443, 84, .69)}${cloud(606, 57, .83)}
      <path d="M14 267Q99 195 185 228Q254 159 351 212Q443 163 556 219Q634 194 707 227V321H14Z" fill="#beb8c9"/>
      <path d="M100 266Q201 210 282 241Q381 202 452 237Q542 190 627 230Q670 213 706 225V310H15V277Z" fill="#a8b8a3"/>
      <g stroke="#b9999b" stroke-width="1.8">
        <path d="M238 187H480V283H238Z" fill="#edcbb5"/>
        <path d="M283 174V157H295V164H306V155H320V164H333V155H347V164H361V155H376V164H388V155H403V164H417V155H430V164H439V181H283Z" fill="#ebc5b3"/>
        <path d="M294 175H429V282H294Z" fill="#f1d7be"/>
      </g>
      ${turret(247, 173, .95)}${turret(470, 170, .98)}${turret(315, 138, .78)}${turret(402, 133, .88)}
      <path d="M261 223v-13h13v7h12v-8h14v8h12v-9h14v9h13v-8h14v8h13v-9h14v9h13v-8h14v8h13v-8h14v8h12v-8h13v18h-198Z" fill="#e9c3b3" stroke="#b79b9c" stroke-width="1.6"/>
      <path d="M259 226H462V282H259Z" fill="#efd5bc" stroke="#b79b9c" stroke-width="1.8"/>
      <path d="M340 283V256Q358 228 377 256V283Z" fill="#ab8e90"/><path d="M346 283V258Q359 240 372 258V283Z" fill="#8f848e"/>
      <g fill="#b59b9f"><path d="M273 253v-9q4-8 8 0v9Zm165 0v-9q4-8 8 0v9Z"/></g>
      <path d="M14 309Q112 260 224 277Q314 291 399 279Q573 255 708 290V417H14Z" fill="#bad0ab"/>
      <path d="M355 282Q376 288 349 300Q314 317 339 340Q368 367 430 414H290Q271 382 268 354Q264 328 310 306Q339 294 345 283Z" fill="#e3cbb1"/>
      <g fill="#96b694"><path d="M17 311Q31 291 47 295Q52 277 69 280Q83 277 89 297Q108 289 115 302Q130 297 143 312Z"/><path d="M581 307Q598 286 615 293Q631 272 648 290Q669 270 683 289Q700 284 709 300V309Z"/></g>
      <path d="M32 375Q102 354 168 366M511 367Q595 348 682 361" fill="none" stroke="#acc39c" stroke-width="2.3"/>`;
  }

  function night() {
    const stars = [[52,70,.75],[107,134,.45],[167,42,.48],[226,97,.7],[302,55,.48],[380,112,.55],[448,55,.68],[541,104,.44],[666,123,.65],[490,168,.42],[68,177,.44]];
    return `<g fill="#ffeabe">${stars.map(([x,y,size]) => spark(x,y,size)).join('')}</g>
      <g fill="#efdfc1"><circle cx="143" cy="89" r="1.8"/><circle cx="211" cy="52" r="1.9"/><circle cx="263" cy="146" r="1.5"/><circle cx="324" cy="85" r="1.5"/><circle cx="400" cy="56" r="1.6"/><circle cx="511" cy="64" r="1.4"/><circle cx="657" cy="51" r="1.6"/><circle cx="605" cy="162" r="1.5"/></g>
      <g transform="translate(-107 -6)" fill="#fce6ae" stroke="#e4d3b9"><path d="M602 58C584 69 582 91 594 108Q603 118 619 118C598 133 572 124 566 104C558 81 575 58 602 58Z" stroke-width="1.3"/></g>
      <path d="M54 130l38-17 37 9 30-35" fill="none" stroke="#c6bfd7" opacity=".57"/>
      <g fill="#e1d6e2"><circle cx="54" cy="130" r="2"/><circle cx="92" cy="113" r="2.7"/><circle cx="129" cy="122" r="2"/><circle cx="159" cy="87" r="2.5"/></g>
      <path d="M11 262Q102 183 188 214Q273 178 367 233Q453 179 525 195Q623 157 707 210V305H11Z" fill="#8483a6"/>
      <path d="M12 288Q127 217 240 241Q334 276 443 237Q532 212 620 234Q657 213 710 224V328H12Z" fill="#6b7692"/>
      <g transform="translate(27 239)"><path d="M0 8L25-10L48 8V39H0Z" fill="#6a6684"/><path d="M-3 9L25-13L51 8" fill="none" stroke="#555774" stroke-width="4"/><path d="M8 16h8v9H8Zm22-1h8v9h-8Z" fill="#f4d896"/></g>
      <g transform="translate(620 224)"><path d="M0 9L25-8L48 8V42H0Z" fill="#676786"/><path d="M-3 9L24-12L52 9" stroke="#555a77" fill="none" stroke-width="4"/><path d="M9 17h8v9H9Zm20 0h8v9h-8Z" fill="#eecb8e"/></g>
      <path d="M16 283Q98 255 188 275Q307 307 442 278Q576 251 706 276V417H16Z" fill="#9295ac"/>
      <path d="M15 350Q130 318 215 343Q342 374 490 340Q597 318 710 337V418H15Z" fill="#aa9eb0"/>
      <g fill="#f2d4a9" opacity=".84"><circle cx="52" cy="348" r="2.2"/><circle cx="67" cy="337" r="1.5"/><circle cx="642" cy="333" r="2"/><circle cx="657" cy="323" r="1.4"/></g>`;
  }

  function fair() {
    return `${cloud(156, 76, .8)}${cloud(359, 81, .65)}${cloud(618, 114, .78)}
      <path d="M14 290Q104 231 193 265Q278 224 373 259Q477 211 562 245Q620 226 710 246V333H14Z" fill="#b5c8b3"/>
      <g transform="translate(523 178)" stroke="#9897a1" stroke-width="3.4" fill="none">
        <circle r="92"/><circle r="84" stroke="#c4a6a0" stroke-width="2"/>
        <path d="M0-92V92M-92 0H92M-65-65L65 65M65-65L-65 65" stroke="#a9a2a8" stroke-width="2.5"/>
        <path d="M-40 133L0 0L39 133M-31 114H32" stroke-width="7" stroke="#b49793"/>
        <circle r="10" fill="#e5b183" stroke="#b18f83"/><circle r="4" fill="#ffdfac" stroke="none"/>
        ${[[0,-92,'#da9596'],[65,-65,'#82b8af'],[92,0,'#e7bf76'],[65,65,'#d9959a'],[0,92,'#87b8ae'],[-65,65,'#e5bc77'],[-92,0,'#d79599'],[-65,-65,'#80b6ae']].map(([x,y,color]) =>
          `<g transform="translate(${x} ${y})" stroke-width="1.7"><path d="M-9 11L-5 1Q0-3 5 1L9 11Z" stroke="#a08f91"/><path d="M-12 9h24l-3 13q-9 6-18 0Z" fill="${color}" stroke="#a18c86"/></g>`).join('')}
      </g>
      <g stroke="#b78b86" stroke-width="1.8" stroke-linejoin="round">
        <path d="M30 240H211L204 307H39Z" fill="#f6d8ae"/>
        <path d="M52 240H75L76 305H55ZM103 240H123V306H103ZM157 240H179L176 305H156Z" fill="#e6aaa0" stroke="none"/>
        <path d="M31 240Q68 219 116 162Q162 215 213 240Q202 251 190 243Q180 252 169 244Q158 251 147 245Q138 251 126 245Q114 252 102 245Q89 252 77 245Q66 250 55 244Q41 250 31 240Z" fill="#f6dfba"/>
        <path d="M116 162Q80 220 57 243Q43 249 31 240Q81 211 116 162ZM116 162Q109 215 91 246Q106 247 116 244Q128 249 137 246Q125 214 116 162ZM116 162Q166 214 212 240Q203 250 190 243C169 224 142 193 116 162Z" fill="#de9a9a" stroke="none"/>
        <path d="M116 162v-22q14-5 24 1l-21 8" fill="#85b5b0"/>
      </g>
      <path d="M13 308Q107 289 213 302Q317 313 431 299Q569 282 710 300V417H13Z" fill="#ecc7aa"/>
      <path d="M14 365Q143 337 244 352M444 346Q583 328 709 347" fill="none" stroke="#dfb599" stroke-width="2.5"/>
      <path d="M14 40Q183 116 366 42" fill="none" stroke="#aa8d8b" stroke-width="2"/>
      <g stroke-linejoin="round"><path d="M31 48l18 7-14 16Z" fill="#de9aa2"/><path d="M73 62l19 5-12 18Z" fill="#82b9b1"/><path d="M119 72l19 2-10 19Z" fill="#e8c37f"/><path d="M169 77l18 .3-8 20Z" fill="#d99aa6"/><path d="M218 75l18-2-5 20Z" fill="#88b9af"/><path d="M267 68l18-4-4 20Z" fill="#eac682"/><path d="M315 58l17-6-3 21Z" fill="#db9ba5"/></g>`;
  }

  function snow() {
    return `${cloud(79, 81, .9)}${cloud(415, 77, .82)}<circle cx="631" cy="78" r="26" fill="#f6e5b7"/>
      <path d="M12 242L113 143L153 167L247 72L344 181L389 139L480 222L551 128L633 204L710 142V310H12Z" fill="#a7bbce"/>
      <path d="M74 181l39-38 35 30-20-6-12 10-8-14Zm120-54 53-55 56 63-28-12-13 13-18-23-17 21-5-15Zm177 30 18-18 28 25-16-5-8 7-7-12Zm148 11 32-40 39 36-18-6-10 9-10-18-10 12Z" fill="#f2f5ed"/>
      <path d="M9 258Q96 213 189 234Q267 207 355 242Q471 201 561 226Q642 209 708 226V310H9Z" fill="#c6d9de"/>
      ${pine(608, 273, .75, '#9ab7b5', '#c4d6ce')}${pine(678, 290, 1.47, '#78a0a2', '#b6d0cb')}${pine(30, 283, .88, '#a1bcb8', '#c4d8d3')}
      <path d="M12 279Q99 252 197 274Q301 302 414 277Q547 244 707 271V418H12Z" fill="#edf2ed"/>
      <path d="M14 353Q90 318 219 333Q304 342 389 334Q562 305 709 323V416H14Z" fill="#dce8e9"/>
      <path d="M399 339Q498 311 618 321M40 366Q107 339 185 346" fill="none" stroke="#c8dade" stroke-width="2.3"/>
      <g transform="translate(60 312)" stroke="#aebfc6" stroke-width="1.5">
        <path d="M-17 0l-18-12m6 5-3-8m40 14 18-10m-6 3 2-7" stroke="#967d68" stroke-width="2"/>
        <ellipse cy="9" rx="23" ry="24" fill="#f9f8ed"/><circle cy="-21" r="17" fill="#fff9ec"/>
        <path d="M-18-11q15 5 35 0l-1 6q-9 4-16 3l4 13-8-2-3-12q-8 0-12-3Z" fill="#d79baa" stroke="#bf8c9c"/>
        <path d="M-16-32q0-18 14-20q13-1 17 18Z" fill="#749da7" stroke="#628694"/><path d="M-19-34q19-5 37 0l-1 5q-19-4-36 0Z" fill="#95b5b8" stroke="#71959b"/><circle cx="-1" cy="-52" r="4" fill="#ecddbe"/>
        <g stroke="none"><circle cx="-5" cy="-22" r="1.7" fill="#657483"/><circle cx="6" cy="-23" r="1.7" fill="#657483"/><path d="M0-21l12 3-13 1Z" fill="#e5a56f"/><circle cy="9" r="2" fill="#909eaa"/><circle cy="19" r="2" fill="#909eaa"/></g>
      </g>
      <g fill="#fffbee" opacity=".93"><circle cx="46" cy="63" r="2"/><circle cx="180" cy="91" r="2.3"/><circle cx="295" cy="54" r="2"/><circle cx="353" cy="116" r="1.8"/><circle cx="519" cy="74" r="2.3"/><circle cx="606" cy="146" r="2"/><circle cx="668" cy="112" r="2.3"/></g>`;
  }

  const scenes = {
    studio: { name: 'Estudio', sky: ['#f0cdd4', '#ffe6d2'], draw: studio },
    garden: { name: 'Jardín', sky: ['#f1d8d5', '#fff1ce'], draw: garden },
    beach: { name: 'Playa', sky: ['#a8d7dd', '#e7e9cb'], draw: beach },
    forest: { name: 'Bosque', sky: ['#bad7d2', '#e2e5cb'], draw: forest },
    castle: { name: 'Castillo', sky: ['#ddd2e6', '#fce1c2'], draw: castle },
    night: { name: 'Noche estrellada', sky: ['#525982', '#bcaac3'], draw: night },
    fair: { name: 'Feria', sky: ['#f0d4c6', '#f9e7c5'], draw: fair },
    snow: { name: 'Nieve', sky: ['#b7d1e0', '#e2e9ed'], draw: snow },
  };
  const choices = Object.entries(scenes).map(([id, scene]) => [id, scene.name]);

  function renderBackdrop(sceneId, prefix = 'postcard') {
    const key = Object.hasOwn(scenes, sceneId) ? sceneId : 'studio';
    const scene = scenes[key];
    const safePrefix = String(prefix).replace(/[^a-zA-Z0-9-]/gu, char => '_' + char.codePointAt(0).toString(16) + '_');
    const id = 'backdrop-' + safePrefix + '-' + key;
    return `<defs>
      <clipPath id="${id}-clip">${panel}</clipPath>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${scene.sky[0]}"/><stop offset="1" stop-color="${scene.sky[1]}"/></linearGradient>
      </defs><g clip-path="url(#${id}-clip)" stroke-linecap="round" stroke-linejoin="round">
      <rect x="19" y="19" width="682" height="395" fill="url(#${id}-sky)"/>${scene.draw(id)}</g>`;
  }

  window.MakeupBackdrops = { choices, renderBackdrop };
})();
