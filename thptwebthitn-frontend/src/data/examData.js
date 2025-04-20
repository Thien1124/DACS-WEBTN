// Dữ liệu mẫu cho danh sách đề thi
export const mockExams = [
  {
    id: 1,
    title: "Đề thi THPT Quốc Gia môn Toán 2024",
    subjectId: 1,
    subject: { id: 1, name: "Toán Học" },
    questionCount: 50,
    duration: 90,
    isActive: true,
    isApproved: true,
    createdAt: "2024-04-10T08:30:00Z",
    updatedAt: "2024-04-15T10:45:00Z",
    grade: 12,
    description: "Đề thi THPT Quốc Gia môn Toán năm 2024"
  },
  {
    id: 2,
    title: "Đề thi giữa kỳ Vật Lý lớp 11",
    subjectId: 2,
    subject: { id: 2, name: "Vật Lý" },
    questionCount: 40,
    duration: 60,
    isActive: true,
    isApproved: true,
    createdAt: "2024-04-05T09:15:00Z",
    updatedAt: "2024-04-12T11:30:00Z",
    grade: 11,
    description: "Đề thi giữa kỳ môn Vật Lý dành cho học sinh lớp 11"
  },
  {
    id: 3,
    title: "Đề thi thử Hóa Học THPT",
    subjectId: 3,
    subject: { id: 3, name: "Hóa Học" },
    questionCount: 45,
    duration: 75,
    isActive: true,
    isApproved: false,
    createdAt: "2024-04-08T14:20:00Z",
    updatedAt: "2024-04-14T16:10:00Z",
    grade: 12,
    description: "Đề thi thử THPT Quốc Gia môn Hóa học"
  },
  {
    id: 4,
    title: "Đề thi Tiếng Anh học kỳ 1",
    subjectId: 4,
    subject: { id: 4, name: "Tiếng Anh" },
    questionCount: 50,
    duration: 60,
    isActive: false,
    isApproved: true,
    createdAt: "2024-03-25T10:30:00Z",
    updatedAt: "2024-04-05T15:45:00Z",
    grade: 10,
    description: "Đề thi học kỳ 1 môn Tiếng Anh"
  },
  {
    id: 5,
    title: "Đề cương ôn tập Ngữ Văn lớp 12",
    subjectId: 5,
    subject: { id: 5, name: "Ngữ Văn" },
    questionCount: 35,
    duration: 120,
    isActive: true,
    isApproved: false,
    createdAt: "2024-04-01T11:00:00Z",
    updatedAt: "2024-04-10T09:20:00Z",
    grade: 12,
    description: "Đề cương ôn tập học kỳ 2 môn Ngữ Văn lớp 12"
  },
  {
    id: 6,
    title: "Đề thi thử Sinh Học THPT Quốc Gia",
    subjectId: 6,
    subject: { id: 6, name: "Sinh Học" },
    questionCount: 40,
    duration: 50,
    isActive: true,
    isApproved: true,
    createdAt: "2024-03-28T08:45:00Z",
    updatedAt: "2024-04-08T14:30:00Z",
    grade: 12,
    description: "Đề thi thử THPT Quốc Gia môn Sinh học năm 2024"
  },
  {
    id: 7,
    title: "Đề thi Địa Lý học kỳ 2",
    subjectId: 7,
    subject: { id: 7, name: "Địa Lý" },
    questionCount: 30,
    duration: 45,
    isActive: false,
    isApproved: true,
    createdAt: "2024-03-15T09:30:00Z",
    updatedAt: "2024-03-25T13:15:00Z",
    grade: 11,
    description: "Đề thi học kỳ 2 môn Địa Lý lớp 11"
  },
  {
    id: 8,
    title: "Đề thi Lịch Sử giữa kỳ",
    subjectId: 8,
    subject: { id: 8, name: "Lịch Sử" },
    questionCount: 35,
    duration: 45,
    isActive: true,
    isApproved: false,
    createdAt: "2024-04-02T10:20:00Z",
    updatedAt: "2024-04-12T11:05:00Z",
    grade: 10,
    description: "Đề thi giữa kỳ môn Lịch Sử lớp 10"
  },
  {
    id: 9,
    title: "Đề thi Tin Học lập trình C++",
    subjectId: 9,
    subject: { id: 9, name: "Tin Học" },
    questionCount: 25,
    duration: 60,
    isActive: true,
    isApproved: true,
    createdAt: "2024-03-20T13:40:00Z",
    updatedAt: "2024-04-03T15:25:00Z",
    grade: 11,
    description: "Đề thi thực hành lập trình C++ môn Tin học"
  },
  {
    id: 10,
    title: "Đề thi GDCD lớp 12",
    subjectId: 10,
    subject: { id: 10, name: "GDCD" },
    questionCount: 40,
    duration: 50,
    isActive: true,
    isApproved: false,
    createdAt: "2024-04-05T11:15:00Z",
    updatedAt: "2024-04-15T10:30:00Z",
    grade: 12,
    description: "Đề thi học kỳ 1 môn GDCD lớp 12"
  }
];

// Danh sách các môn học để lọc
export const mockSubjects = [
  { id: 1, name: "Toán Học" },
  { id: 2, name: "Vật Lý" },
  { id: 3, name: "Hóa Học" },
  { id: 4, name: "Tiếng Anh" },
  { id: 5, name: "Ngữ Văn" },
  { id: 6, name: "Sinh Học" },
  { id: 7, name: "Địa Lý" },
  { id: 8, name: "Lịch Sử" },
  { id: 9, name: "Tin Học" },
  { id: 10, name: "GDCD" }
];
  
export const demoQuestions = {
  "demo-exam-1": [
    {
      id: "q1-exam1",
      content: "Cho hàm số $f(x) = x^3 - 3x^2 + mx + n$ có đồ thị là đường cong cắt trục hoành tại ba điểm phân biệt. Số điểm cực trị của hàm số đã cho là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Đạo hàm $f'(x) = 3x^2 - 6x + m$. Để có cực trị, cần $f'(x) = 0$, tức $3x^2 - 6x + m = 0$. Phương trình này có 2 nghiệm phân biệt.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "1", isCorrect: false },
        { id: "q1-opt2", content: "2", isCorrect: true },
        { id: "q1-opt3", content: "3", isCorrect: false },
        { id: "q1-opt4", content: "4", isCorrect: false }
      ]
    },
    {
      id: "q2-exam1",
      content: "Cho số phức $z = \\frac{1+i}{1-i}$. Môđun của số phức $z$ là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "$z = \\frac{1+i}{1-i} = \\frac{(1+i)(1+i)}{(1-i)(1+i)} = \\frac{1+2i+i^2}{1^2-i^2} = \\frac{1+2i-1}{2} = i$. Do đó $|z| = |i| = 1$",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "0", isCorrect: false },
        { id: "q2-opt2", content: "1", isCorrect: true },
        { id: "q2-opt3", content: "2", isCorrect: false },
        { id: "q2-opt4", content: "$\\sqrt{2}$", isCorrect: false }
      ]
    },
    {
      id: "q3-exam1",
      content: "Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác đều cạnh $a$, $SA$ vuông góc với mặt phẳng đáy, $SA = a$. Góc giữa hai mặt phẳng $(SAB)$ và $(SAC)$ là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Gọi $H$ là hình chiếu của $S$ lên mặt phẳng đáy. Khi đó $H$ trùng với $A$. Góc giữa hai mặt phẳng $(SAB)$ và $(SAC)$ chính là góc giữa hai vectơ pháp tuyến, hay góc $BAC = 60^{\\circ}$.",
      questionIndex: 3,
      options: [
        { id: "q3-opt1", content: "$30^{\\circ}$", isCorrect: false },
        { id: "q3-opt2", content: "$45^{\\circ}$", isCorrect: false },
        { id: "q3-opt3", content: "$60^{\\circ}$", isCorrect: true },
        { id: "q3-opt4", content: "$90^{\\circ}$", isCorrect: false }
      ]
    },
    {
      id: "q4-exam1",
      content: "Giá trị lớn nhất của hàm số $f(x) = \\sin x + \\cos x$ trên đoạn $[0; 2\\pi]$ là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Ta có $f(x) = \\sin x + \\cos x = \\sqrt{2}\\sin(x + \\frac{\\pi}{4})$. Giá trị lớn nhất của $\\sin(x + \\frac{\\pi}{4})$ là 1, nên giá trị lớn nhất của $f(x)$ là $\\sqrt{2}$.",
      questionIndex: 4,
      options: [
        { id: "q4-opt1", content: "0", isCorrect: false },
        { id: "q4-opt2", content: "1", isCorrect: false },
        { id: "q4-opt3", content: "$\\sqrt{2}$", isCorrect: true },
        { id: "q4-opt4", content: "2", isCorrect: false }
      ]
    },
    {
      id: "q5-exam1",
      content: "Cho cấp số cộng $(u_n)$ có $u_1 = 3$ và $u_2 = 7$. Tổng 10 số hạng đầu tiên của cấp số cộng đã cho là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Công sai $d = u_2 - u_1 = 7 - 3 = 4$. Tổng 10 số hạng đầu tiên: $S_{10} = \\frac{10}{2}(2u_1 + 9d) = 5(6 + 36) = 5 \\cdot 42 = 210$",
      questionIndex: 5,
      options: [
        { id: "q5-opt1", content: "185", isCorrect: false },
        { id: "q5-opt2", content: "195", isCorrect: false },
        { id: "q5-opt3", content: "200", isCorrect: false },
        { id: "q5-opt4", content: "210", isCorrect: true }
      ]
    }
  ],
  "demo-exam-2": [
    {
      id: "q1-exam2",
      content: "Một vật dao động điều hòa với chu kỳ $T = 2$ s và biên độ $A = 10$ cm. Tại thời điểm $t = 0$, vật đi qua vị trí cân bằng theo chiều dương. Phương trình dao động của vật là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Ta có $\\omega = \\frac{2\\pi}{T} = \\pi$ rad/s. Tại $t = 0$, $x = 0$ và $v > 0$ nên $\\varphi = 0$. Vậy $x = 10\\sin(\\pi t)$ cm.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "$x = 10\\sin(\\pi t)$ cm", isCorrect: true },
        { id: "q1-opt2", content: "$x = 10\\cos(\\pi t)$ cm", isCorrect: false },
        { id: "q1-opt3", content: "$x = 10\\sin(2\\pi t)$ cm", isCorrect: false },
        { id: "q1-opt4", content: "$x = 10\\cos(2\\pi t)$ cm", isCorrect: false }
      ]
    },
    {
      id: "q2-exam2",
      content: "Trong thí nghiệm Young về giao thoa ánh sáng, nguồn sáng phát ra ánh sáng đơn sắc có bước sóng $\\lambda = 0,6$ μm. Khoảng cách giữa hai khe là $a = 1$ mm, khoảng cách từ mặt phẳng chứa hai khe đến màn là $D = 2$ m. Khoảng vân quan sát được trên màn là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Khoảng vân: $i = \\frac{\\lambda D}{a} = \\frac{0,6 \\cdot 10^{-6} \\cdot 2}{10^{-3}} = 1,2 \\cdot 10^{-3}$ m = 1,2 mm",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "0,6 mm", isCorrect: false },
        { id: "q2-opt2", content: "1,2 mm", isCorrect: true },
        { id: "q2-opt3", content: "1,5 mm", isCorrect: false },
        { id: "q2-opt4", content: "2,4 mm", isCorrect: false }
      ]
    },
    {
      id: "q3-exam2",
      content: "Một vật có khối lượng $m = 100$ g được ném thẳng đứng lên cao với vận tốc ban đầu $v_0 = 10$ m/s. Lấy $g = 10$ m/s². Độ cao cực đại mà vật đạt được là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Độ cao cực đại: $h_{max} = \\frac{v_0^2}{2g} = \\frac{10^2}{2 \\cdot 10} = 5$ m",
      questionIndex: 3,
      options: [
        { id: "q3-opt1", content: "2,5 m", isCorrect: false },
        { id: "q3-opt2", content: "5 m", isCorrect: true },
        { id: "q3-opt3", content: "10 m", isCorrect: false },
        { id: "q3-opt4", content: "20 m", isCorrect: false }
      ]
    },
    {
      id: "q4-exam2",
      content: "Một mạch dao động LC lí tưởng gồm cuộn cảm thuần có độ tự cảm $L = 0,4$ μH và tụ điện có điện dung $C = 10$ pF. Tần số dao động riêng của mạch là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Tần số dao động riêng: $f = \\frac{1}{2\\pi\\sqrt{LC}} = \\frac{1}{2\\pi\\sqrt{0,4 \\cdot 10^{-6} \\cdot 10^{-11}}} = 25,2 \\cdot 10^6$ Hz = 25,2 MHz",
      questionIndex: 4,
      options: [
        { id: "q4-opt1", content: "2,52 MHz", isCorrect: false },
        { id: "q4-opt2", content: "12,6 MHz", isCorrect: false },
        { id: "q4-opt3", content: "25,2 MHz", isCorrect: true },
        { id: "q4-opt4", content: "50,4 MHz", isCorrect: false }
      ]
    },
    {
      id: "q5-exam2",
      content: "Hạt nhân $^{226}_{88}$Ra phát ra tia $\\alpha$ và biến đổi thành hạt nhân:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Phương trình phản ứng: $^{226}_{88}\\textrm{Ra} \\to ^{222}_{86}\\textrm{Rn} + ^4_2\\textrm{He}$",
      questionIndex: 5,
      options: [
        { id: "q5-opt1", content: "$^{222}_{86}\\textrm{Rn}$", isCorrect: true },
        { id: "q5-opt2", content: "$^{222}_{87}\\textrm{Fr}$", isCorrect: false },
        { id: "q5-opt3", content: "$^{230}_{90}\\textrm{Th}$", isCorrect: false },
        { id: "q5-opt4", content: "$^{226}_{89}\\textrm{Ac}$", isCorrect: false }
      ]
    }
  ],
  "demo-exam-3": [
    {
      id: "q1-exam3",
      content: "Cho các chất: (1) CH₃NH₂; (2) CH₃COOH; (3) H₂NCH₂COOH; (4) CH₃COOCH₃. Số chất tham gia phản ứng thủy phân trong môi trường kiềm là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Các chất tham gia phản ứng thủy phân trong môi trường kiềm là este (4) và peptit/protein (không có). Vậy có 1 chất.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "1", isCorrect: true },
        { id: "q1-opt2", content: "2", isCorrect: false },
        { id: "q1-opt3", content: "3", isCorrect: false },
        { id: "q1-opt4", content: "4", isCorrect: false }
      ]
    },
    {
      id: "q2-exam3",
      content: "Kim loại nào sau đây điều chế được bằng phương pháp điện phân dung dịch?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Các kim loại hoạt động yếu hơn H₂ có thể điều chế bằng phương pháp điện phân dung dịch muối của chúng. Cu, Ag, Au đều đứng sau H trong dãy hoạt động hóa học.",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "Na", isCorrect: false },
        { id: "q2-opt2", content: "Al", isCorrect: false },
        { id: "q2-opt3", content: "Cu", isCorrect: true },
        { id: "q2-opt4", content: "Ca", isCorrect: false }
      ]
    },
    {
      id: "q3-exam3",
      content: "Chất nào sau đây là chất điện li mạnh?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Axit HCl là một axit mạnh, điện li hoàn toàn trong dung dịch nước.",
      questionIndex: 3,
      options: [
        { id: "q3-opt1", content: "CH₃COOH", isCorrect: false },
        { id: "q3-opt2", content: "HCl", isCorrect: true },
        { id: "q3-opt3", content: "H₂CO₃", isCorrect: false },
        { id: "q3-opt4", content: "NH₄OH", isCorrect: false }
      ]
    },
    {
      id: "q4-exam3",
      content: "Tơ nào sau đây thuộc loại tơ nhân tạo?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Tơ visco là tơ nhân tạo, được điều chế từ xenlulozơ tự nhiên qua quá trình xử lý hóa học.",
      questionIndex: 4,
      options: [
        { id: "q4-opt1", content: "Tơ tằm", isCorrect: false },
        { id: "q4-opt2", content: "Tơ capron", isCorrect: false },
        { id: "q4-opt3", content: "Tơ visco", isCorrect: true },
        { id: "q4-opt4", content: "Tơ nilon-6,6", isCorrect: false }
      ]
    },
    {
      id: "q5-exam3",
      content: "Phương trình hóa học nào sau đây sai?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Phương trình (4) sai vì CO₂ không tác dụng với dung dịch NaOH đặc nóng, nó chỉ tạo ra Na₂CO₃ khi tác dụng với NaOH.",
      questionIndex: 5,
      options: [
        { id: "q5-opt1", content: "Fe + 2HCl → FeCl₂ + H₂", isCorrect: false },
        { id: "q5-opt2", content: "2NaOH + CO₂ → Na₂CO₃ + H₂O", isCorrect: false },
        { id: "q5-opt3", content: "CaO + H₂O → Ca(OH)₂", isCorrect: false },
        { id: "q5-opt4", content: "2NaOH(đặc, nóng) + CO₂ → 2Na + CO₃² + H₂O", isCorrect: true }
      ]
    }
  ]
};

// Dữ liệu mẫu câu hỏi cho các đề thi
export const mockQuestions = {
  // ID 1: Đề thi THPT Quốc Gia môn Toán 2024
  "1": [
    {
      id: "q1-exam1",
      content: "Cho hàm số $f(x) = x^3 - 3x^2 + mx + n$ có đồ thị là đường cong cắt trục hoành tại ba điểm phân biệt. Số điểm cực trị của hàm số đã cho là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Đạo hàm $f'(x) = 3x^2 - 6x + m$. Để có cực trị, cần $f'(x) = 0$, tức $3x^2 - 6x + m = 0$. Phương trình này có 2 nghiệm phân biệt.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "1", isCorrect: false },
        { id: "q1-opt2", content: "2", isCorrect: true },
        { id: "q1-opt3", content: "3", isCorrect: false },
        { id: "q1-opt4", content: "4", isCorrect: false }
      ]
    },
    {
      id: "q2-exam1",
      content: "Cho số phức $z = \\frac{1+i}{1-i}$. Môđun của số phức $z$ là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "$z = \\frac{1+i}{1-i} = \\frac{(1+i)(1+i)}{(1-i)(1+i)} = \\frac{1+2i+i^2}{1^2-i^2} = \\frac{1+2i-1}{2} = i$. Do đó $|z| = |i| = 1$",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "0", isCorrect: false },
        { id: "q2-opt2", content: "1", isCorrect: true },
        { id: "q2-opt3", content: "2", isCorrect: false },
        { id: "q2-opt4", content: "$\\sqrt{2}$", isCorrect: false }
      ]
    },
    // Thêm 8 câu hỏi nữa để đủ 10 câu
  ],

  // ID 2: Đề thi giữa kỳ Vật Lý lớp 11
  "2": [
    {
      id: "q1-exam2",
      content: "Một vật dao động điều hòa với chu kỳ $T = 2$ s và biên độ $A = 10$ cm. Phương trình dao động của vật là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Ta có $\\omega = \\frac{2\\pi}{T} = \\pi$ rad/s. Phương trình dao động: $x = 10\\sin(\\pi t)$ cm.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "$x = 10\\sin(\\pi t)$ cm", isCorrect: true },
        { id: "q1-opt2", content: "$x = 10\\cos(\\pi t)$ cm", isCorrect: false },
        { id: "q1-opt3", content: "$x = 10\\sin(2\\pi t)$ cm", isCorrect: false },
        { id: "q1-opt4", content: "$x = 10\\cos(2\\pi t)$ cm", isCorrect: false }
      ]
    },
    {
      id: "q2-exam2",
      content: "Trong thí nghiệm Young về giao thoa ánh sáng, khoảng vân quan sát được trên màn là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Khoảng vân: $i = \\frac{\\lambda D}{a} = \\frac{0,6 \\cdot 10^{-6} \\cdot 2}{10^{-3}} = 1,2 \\cdot 10^{-3}$ m = 1,2 mm",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "0,6 mm", isCorrect: false },
        { id: "q2-opt2", content: "1,2 mm", isCorrect: true },
        { id: "q2-opt3", content: "1,5 mm", isCorrect: false },
        { id: "q2-opt4", content: "2,4 mm", isCorrect: false }
      ]
    },
    // Thêm 8 câu hỏi nữa để đủ 10 câu
  ],

  // ID 3: Đề thi thử Hóa Học THPT
  "3": [
    {
      id: "q1-exam3",
      content: "Cho các chất: (1) CH₃NH₂; (2) CH₃COOH; (3) H₂NCH₂COOH; (4) CH₃COOCH₃. Số chất tham gia phản ứng thủy phân trong môi trường kiềm là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Các chất tham gia phản ứng thủy phân trong môi trường kiềm là este (4) và peptit/protein (không có). Vậy có 1 chất.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "1", isCorrect: true },
        { id: "q1-opt2", content: "2", isCorrect: false },
        { id: "q1-opt3", content: "3", isCorrect: false },
        { id: "q1-opt4", content: "4", isCorrect: false }
      ]
    },
    {
      id: "q2-exam3",
      content: "Kim loại nào sau đây điều chế được bằng phương pháp điện phân dung dịch?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Các kim loại hoạt động yếu hơn H₂ có thể điều chế bằng điện phân dung dịch muối.",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "Na", isCorrect: false },
        { id: "q2-opt2", content: "Al", isCorrect: false },
        { id: "q2-opt3", content: "Cu", isCorrect: true },
        { id: "q2-opt4", content: "Ca", isCorrect: false }
      ]
    },
    // Thêm 8 câu hỏi nữa để đủ 10 câu
  ],

  // ID 4: Đề thi Tiếng Anh học kỳ 1
  "4": [
    {
      id: "q1-exam4",
      content: "Choose the word whose underlined part is pronounced differently: th**ough**, en**ough**, t**ough**, r**ough**",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Though: /ðəʊ/, enough: /ɪˈnʌf/, tough: /tʌf/, rough: /rʌf/. The word 'though' has a different pronunciation.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "though", isCorrect: true },
        { id: "q1-opt2", content: "enough", isCorrect: false },
        { id: "q1-opt3", content: "tough", isCorrect: false },
        { id: "q1-opt4", content: "rough", isCorrect: false }
      ]
    },
    {
      id: "q2-exam4",
      content: "If I _____ the lottery, I would buy a new house.",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Type 2 conditional (imaginary situation in the present) requires the past simple tense in the if-clause.",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "win", isCorrect: false },
        { id: "q2-opt2", content: "won", isCorrect: true },
        { id: "q2-opt3", content: "will win", isCorrect: false },
        { id: "q2-opt4", content: "have won", isCorrect: false }
      ]
    },
    {
      id: "q3-exam4",
      content: "She asked me where I _____ the previous weekend.",
      questionType: "MULTIPLE_CHOICE",
      explanation: "In reported speech, the past simple 'went' changes to past perfect 'had gone'.",
      questionIndex: 3,
      options: [
        { id: "q3-opt1", content: "went", isCorrect: false },
        { id: "q3-opt2", content: "go", isCorrect: false },
        { id: "q3-opt3", content: "had gone", isCorrect: true },
        { id: "q3-opt4", content: "have gone", isCorrect: false }
      ]
    },
    {
      id: "q4-exam4",
      content: "Choose the synonym of 'arbitrary':",
      questionType: "MULTIPLE_CHOICE",
      explanation: "'Arbitrary' means based on random choice or personal whim; 'random' is its closest synonym.",
      questionIndex: 4,
      options: [
        { id: "q4-opt1", content: "necessary", isCorrect: false },
        { id: "q4-opt2", content: "random", isCorrect: true },
        { id: "q4-opt3", content: "determined", isCorrect: false },
        { id: "q4-opt4", content: "planned", isCorrect: false }
      ]
    },
    {
      id: "q5-exam4",
      content: "_____ having a headache, she went to school.",
      questionType: "MULTIPLE_CHOICE",
      explanation: "'Despite' is followed by a noun/gerund and expresses contrast.",
      questionIndex: 5,
      options: [
        { id: "q5-opt1", content: "Despite", isCorrect: true },
        { id: "q5-opt2", content: "Although", isCorrect: false },
        { id: "q5-opt3", content: "Because of", isCorrect: false },
        { id: "q5-opt4", content: "However", isCorrect: false }
      ]
    }
  ],

  // ID 5: Đề cương ôn tập Ngữ Văn lớp 12
  "5": [
    {
      id: "q1-exam5",
      content: "Tác phẩm \"Tây Tiến\" của Quang Dũng được sáng tác vào năm nào?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "\"Tây Tiến\" được Quang Dũng sáng tác vào năm 1948, khi tác giả đã rời đơn vị Tây Tiến.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "1945", isCorrect: false },
        { id: "q1-opt2", content: "1948", isCorrect: true },
        { id: "q1-opt3", content: "1950", isCorrect: false },
        { id: "q1-opt4", content: "1954", isCorrect: false }
      ]
    },
    {
      id: "q2-exam5",
      content: "Tác phẩm nào sau đây không phải của nhà văn Nam Cao?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "\"Vợ nhặt\" là tác phẩm của nhà văn Kim Lân, không phải của Nam Cao.",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "Chí Phèo", isCorrect: false },
        { id: "q2-opt2", content: "Lão Hạc", isCorrect: false },
        { id: "q2-opt3", content: "Đời thừa", isCorrect: false },
        { id: "q2-opt4", content: "Vợ nhặt", isCorrect: true }
      ]
    },
    {
      id: "q3-exam5",
      content: "Tình huống truyện trong tác phẩm \"Số phận con người\" của Sô-lô-khốp là gì?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Tình huống chính trong \"Số phận con người\" là cuộc gặp gỡ giữa Andrei Sokolov và cậu bé Vanya.",
      questionIndex: 3,
      options: [
        { id: "q3-opt1", content: "Cuộc gặp gỡ giữa Andrei Sokolov và cậu bé Vanya", isCorrect: true },
        { id: "q3-opt2", content: "Andrei Sokolov bị bắt làm tù binh", isCorrect: false },
        { id: "q3-opt3", content: "Andrei Sokolov trở về quê hương", isCorrect: false },
        { id: "q3-opt4", content: "Andrei Sokolov tham gia chiến đấu", isCorrect: false }
      ]
    },
    {
      id: "q4-exam5",
      content: "Những câu thơ \"Áo anh sứt chỉ đường tà/Vợ anh chưa có mẹ già chưa khâu\" trong bài thơ \"Việt Bắc\" thể hiện điều gì?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Những câu thơ này thể hiện nỗi nhớ thương, sự hy sinh thầm lặng của người cán bộ cách mạng.",
      questionIndex: 4,
      options: [
        { id: "q4-opt1", content: "Cuộc sống khó khăn, thiếu thốn vật chất", isCorrect: false },
        { id: "q4-opt2", content: "Nỗi nhớ thương, sự hy sinh thầm lặng", isCorrect: true },
        { id: "q4-opt3", content: "Mối quan hệ giữa các thế hệ", isCorrect: false },
        { id: "q4-opt4", content: "Truyền thống văn hóa dân tộc", isCorrect: false }
      ]
    },
    {
      id: "q5-exam5",
      content: "Tác giả nào được mệnh danh là \"Người tình của biển cả\"?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Tố Hữu được mệnh danh là \"Lá cờ đầu của thơ ca cách mạng\", còn \"Người tình của biển cả\" là biệt danh của nhà thơ Xuân Quỳnh.",
      questionIndex: 5,
      options: [
        { id: "q5-opt1", content: "Xuân Diệu", isCorrect: false },
        { id: "q5-opt2", content: "Huy Cận", isCorrect: false },
        { id: "q5-opt3", content: "Xuân Quỳnh", isCorrect: true },
        { id: "q5-opt4", content: "Tố Hữu", isCorrect: false }
      ]
    }
  ],

  // ID 10: Đề thi GDCD lớp 12
  "10": [
    {
      id: "q1-exam10",
      content: "Pháp luật là quy tắc xử sự chung, được áp dụng nhiều lần, trong nhiều trường hợp, ở nhiều nơi, đối với mọi người là đặc trưng nào của pháp luật?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Đặc trưng này thể hiện tính quy phạm phổ biến của pháp luật.",
      questionIndex: 1,
      options: [
        { id: "q1-opt1", content: "Tính quy phạm phổ biến", isCorrect: true },
        { id: "q1-opt2", content: "Tính quyền lực nhà nước", isCorrect: false },
        { id: "q1-opt3", content: "Tính xác định chặt chẽ về nội dung", isCorrect: false },
        { id: "q1-opt4", content: "Tính bắt buộc thực hiện", isCorrect: false }
      ]
    },
    {
      id: "q2-exam10",
      content: "Công dân biểu hiện trách nhiệm của mình như thế nào trong việc thực hiện pháp luật?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Công dân biểu hiện trách nhiệm của mình bằng việc tự giác tuân thủ và tích cực tham gia đấu tranh phòng chống các vi phạm pháp luật.",
      questionIndex: 2,
      options: [
        { id: "q2-opt1", content: "Thực hiện đầy đủ nghĩa vụ của mình", isCorrect: false },
        { id: "q2-opt2", content: "Tự giác tuân thủ pháp luật", isCorrect: false },
        { id: "q2-opt3", content: "Tích cực đấu tranh với các hành vi vi phạm pháp luật", isCorrect: false },
        { id: "q2-opt4", content: "Cả A, B và C", isCorrect: true }
      ]
    },
    {
      id: "q3-exam10",
      content: "Bình đẳng về trách nhiệm pháp lý có nghĩa là:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Bình đẳng về trách nhiệm pháp lý là bất kỳ công dân nào vi phạm pháp luật đều phải chịu trách nhiệm theo quy định, không có ngoại lệ.",
      questionIndex: 3,
      options: [
        { id: "q3-opt1", content: "Bất kỳ công dân nào vi phạm pháp luật đều phải chịu trách nhiệm theo quy định", isCorrect: true },
        { id: "q3-opt2", content: "Mọi người đều có quyền như nhau", isCorrect: false },
        { id: "q3-opt3", content: "Mọi người đều có nghĩa vụ như nhau", isCorrect: false },
        { id: "q3-opt4", content: "Không ai phải chịu trách nhiệm pháp lý", isCorrect: false }
      ]
    },
    {
      id: "q4-exam10",
      content: "Nội dung cơ bản của bình đẳng trong hôn nhân và gia đình không bao gồm:",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Bình đẳng về sở hữu tài sản riêng trước hôn nhân là quyền của mỗi người, không phải nội dung của bình đẳng trong hôn nhân và gia đình.",
      questionIndex: 4,
      options: [
        { id: "q4-opt1", content: "Bình đẳng về quan hệ nhân thân", isCorrect: false },
        { id: "q4-opt2", content: "Bình đẳng về quan hệ tài sản", isCorrect: false },
        { id: "q4-opt3", content: "Bình đẳng về sở hữu tài sản riêng trước hôn nhân", isCorrect: true },
        { id: "q4-opt4", content: "Bình đẳng về nghĩa vụ và quyền của cha mẹ đối với con", isCorrect: false }
      ]
    },
    {
      id: "q5-exam10",
      content: "Khoản 3 Điều 36 Hiến pháp 2013 quy định: \"Thanh niên được Nhà nước, gia đình và xã hội tạo điều kiện học tập, lao động, giải trí, phát triển thể lực, trí tuệ...\" là nội dung của quyền nào?",
      questionType: "MULTIPLE_CHOICE",
      explanation: "Quyền được phát triển là quyền cơ bản của công dân được ghi nhận trong Hiến pháp 2013.",
      questionIndex: 5,
      options: [
        { id: "q5-opt1", content: "Quyền học tập", isCorrect: false },
        { id: "q5-opt2", content: "Quyền được phát triển", isCorrect: true },
        { id: "q5-opt3", content: "Quyền tham gia quản lý nhà nước", isCorrect: false },
        { id: "q5-opt4", content: "Quyền tự do kinh doanh", isCorrect: false }
      ]
    }
  ]
};

// Các hàm tiện ích để làm việc với dữ liệu bài thi
export const getQuestionsForExam = (examId) => {
  return mockQuestions[examId] || [];
};

export const calculateScore = (answers, examId) => {
  const questions = mockQuestions[examId] || [];
  let correctCount = 0;
  
  Object.keys(answers).forEach(questionId => {
    const question = questions.find(q => q.id === questionId);
    if (question) {
      const correctOption = question.options.find(opt => opt.isCorrect);
      if (correctOption && correctOption.id === answers[questionId]) {
        correctCount++;
      }
    }
  });
  
  return {
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    score: questions.length > 0 ? (correctCount / questions.length) * 10 : 0
  };
};

// Thông tin chi tiết đề thi kèm theo câu hỏi
export const getExamWithQuestions = (examId) => {
  // Import từ examData để kết hợp thông tin đề thi với câu hỏi
  const { mockExams } = require('./examData');
  const exam = mockExams.find(e => e.id === Number(examId));
  const questions = mockQuestions[examId] || [];
  
  if (!exam) {
    return null;
  }
  
  return {
    ...exam,
    questions
  };
};