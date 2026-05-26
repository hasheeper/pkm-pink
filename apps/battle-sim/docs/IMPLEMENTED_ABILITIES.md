# 已实现特性列表 (Implemented Abilities)

> 生成日期: 2026-01-13
> 来源文件: engine/ability-handlers.js
> 总计: **161个特性**

---

## 一、特性列表（按字母排序）

1. Adaptability
2. Arena Trap
3. Armor Tail
4. Bad Dreams
5. Battle Armor
6. Beast Boost
7. Big Pecks
8. Blaze
9. Bulletproof
10. Chlorophyll
11. Clear Body
12. Comatose
13. Competitive
14. Corrosion
15. Cute Charm
16. Damp
17. Dazzling
18. Defeatist
19. Defiant
20. Disguise
21. Download
22. Drizzle
23. Drought
24. Dry Skin
25. Early Bird
26. Earth Eater
27. Effect Spore
28. Electric Surge
29. Filter
30. Flame Body
31. Flash Fire
32. Full Metal Body
33. Fur Coat
34. Good as Gold
35. Grassy Surge
36. Guts
37. Huge Power
38. Hunger Switch
39. Hyper Cutter
40. Ice Face
41. Illusion
42. Immunity
43. Imposter
44. Infiltrator
45. Inner Focus
46. Insomnia
47. Intimidate
48. Iron Barbs
49. Iron Fist
50. Keen Eye
51. Leaf Guard
52. Levitate
53. Libero
54. Lightning Rod
55. Limber
56. Liquid Voice
57. Liquid Voice Pro
58. Magic Bounce
59. Magic Guard
60. Magma Armor
61. Magnet Pull
62. Marvel Scale
63. Mega Launcher
64. Merciless
65. Mirror Armor
66. Misty Surge
67. Mold Breaker
68. Motor Drive
69. Moxie
70. Multiscale
71. Natural Cure
72. Oblivious
73. Overcoat
74. Overgrow
75. Own Tempo
76. Pastel Veil
77. Poison Heal
78. Poison Point
79. Prankster
80. Protean
81. Protosynthesis
82. Psychic Surge
83. Pure Power
84. Purifying Salt
85. Quark Drive
86. Queenly Majesty
87. Quick Feet
88. Reckless
89. Regenerator
90. Rock Head
91. Rough Skin
92. Sand Force
93. Sand Rush
94. Sand Stream
95. Sap Sipper
96. Serene Grace
97. Shadow Shield
98. Shadow Tag
99. Sharpness
100. Shed Skin
101. Sheer Force
102. Shell Armor
103. Shields Down
104. Skill Link
105. Slow Start
106. Slush Rush
107. Sniper
108. Snow Warning
109. Solar Power
110. Solid Rock
111. Soundproof
112. Speed Boost
113. Stall
114. Stance Change
115. Static
116. Sticky Hold
117. Storm Drain
118. Strong Jaw
119. Sturdy
120. Suction Cups
121. Super Luck
122. Swarm
123. Sweet Veil
124. Swift Swim
125. Technician
126. Teravolt
127. Thick Fat
128. Tinted Lens
129. Torrent
130. Tough Claws
131. Trace
132. Truant
133. Turboblaze
134. Unaware
135. Unburden
136. Vital Spirit
137. Volt Absorb
138. Water Absorb
139. Water Veil
140. Weak Armor
141. Well-Baked Body
142. White Smoke
143. Wind Rider
144. Wonder Guard
145. Zero to Hero
146. Pixilate
147. Aerilate
148. Refrigerate
149. Galvanize
150. Sword of Ruin
151. Beads of Ruin
152. Tablets of Ruin
153. Vessel of Ruin
154. Hustle
155. Analytic
156. Justified
157. Steam Engine
158. Cursed Body
159. Heatproof
160. Simple
161. Contrary

---

## 二、钩子统计 (Hook Statistics)

| 钩子名称 | 使用次数 | 说明 |
|----------|----------|------|
| onImmunity | 26 | 属性免疫判定 |
| onModifyStat | 24 | 修改能力值 |
| onBasePower | 23 | 修改招式威力 |
| onDefenderModifyDamage | 13 | 防御方伤害修正 |
| onAbsorbHit | 10 | 吸收攻击效果 |
| onTryHit | 9 | 命中判定 |
| onBeforeMove | 5 | 行动前效果 |
| onContactDamage | 2 | 接触伤害反击 |
| onModifyPriority | 2 | 优先度修正 |
| preventCrit | 2 | 防止暴击 |
| onModifySTAB | 1 | 修改本系加成 |
| onModifyEffectiveness | 1 | 修改属性克制 |
| onDamageHack | 1 | 伤害修正 |
| onCheckCrit | 1 | 暴击判定 |
| onCritDamage | 1 | 暴击伤害修正 |
| critStageBoost | 1 | 暴击等级加成 |
| groundImmune | 1 | 地面免疫 |
