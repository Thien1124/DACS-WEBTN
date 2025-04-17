export const demoExams = [
    {
      id: "demo-exam-1",
      title: "Đề thi Toán THPT Quốc gia 2023",
      description: "Đề thi thử môn Toán chuẩn cấu trúc Bộ Giáo dục, có đáp án chi tiết và lời giải.",
      subjectId: "math",
      subjectName: "Toán học",
      timeLimit: 90,
      questionCount: 50,
      difficulty: "medium",
      image: "https://placehold.co/800x400/3498db/ffffff?text=To%C3%A1n+THPT+QG",
      isPublished: true,
      createdAt: "2023-12-15T08:30:00Z",
      updatedAt: "2023-12-16T10:15:00Z"
    },
    {
      id: "demo-exam-2",
      title: "Đề thi Vật lý THPT Quốc gia 2023",
      description: "Đề thi thử môn Vật lý theo cấu trúc mới nhất, có đáp án và giải thích chi tiết.",
      subjectId: "physics",
      subjectName: "Vật lý",
      timeLimit: 50,
      questionCount: 40,
      difficulty: "hard",
      image: "https://placehold.co/800x400/e74c3c/ffffff?text=V%E1%BA%ADt+L%C3%BD",
      isPublished: true,
      createdAt: "2023-12-10T09:20:00Z",
      updatedAt: "2023-12-14T11:45:00Z"
    },
    {
      id: "demo-exam-3",
      title: "Đề thi Hóa học THPT Quốc gia 2023",
      description: "Đề thi thử môn Hóa học dành cho học sinh lớp 12, chuẩn bị cho kỳ thi THPT Quốc gia.",
      subjectId: "chemistry",
      subjectName: "Hóa học",
      timeLimit: 50,
      questionCount: 40,
      difficulty: "medium",
      image: "https://placehold.co/800x400/27ae60/ffffff?text=H%C3%B3a+H%E1%BB%8Dc",
      isPublished: true,
      createdAt: "2023-11-28T07:45:00Z",
      updatedAt: "2023-12-05T14:30:00Z"
    },
    {
      id: "demo-exam-4",
      title: "Đề thi Sinh học THPT Quốc gia 2023",
      description: "Đề thi thử môn Sinh học trọng tâm ôn thi THPT Quốc gia, có hướng dẫn giải chi tiết.",
      subjectId: "biology",
      subjectName: "Sinh học",
      timeLimit: 50,
      questionCount: 40,
      difficulty: "easy",
      image: "https://placehold.co/800x400/8e44ad/ffffff?text=Sinh+H%E1%BB%8Dc",
      isPublished: true,
      createdAt: "2023-11-20T10:10:00Z",
      updatedAt: "2023-12-01T09:25:00Z"
    },
    {
      id: "demo-exam-5",
      title: "Đề thi Ngữ văn THPT Quốc gia 2023",
      description: "Đề thi thử môn Ngữ văn theo format mới nhất của Bộ GD&ĐT, có hướng dẫn làm bài.",
      subjectId: "literature",
      subjectName: "Ngữ văn",
      timeLimit: 120,
      questionCount: 20,
      difficulty: "medium",
      image: "https://placehold.co/800x400/f39c12/ffffff?text=Ng%E1%BB%AF+V%C4%83n",
      isPublished: true,
      createdAt: "2023-12-05T08:00:00Z",
      updatedAt: "2023-12-10T16:20:00Z"
    },
    {
      id: "demo-exam-6",
      title: "Đề thi Lịch sử THPT Quốc gia 2023",
      description: "Đề thi thử môn Lịch sử theo cấu trúc đổi mới, có đáp án tham khảo.",
      subjectId: "history",
      subjectName: "Lịch sử",
      timeLimit: 50,
      questionCount: 40,
      difficulty: "medium",
      image: "https://placehold.co/800x400/16a085/ffffff?text=L%E1%BB%8Bch+S%E1%BB%AD",
      isPublished: true,
      createdAt: "2023-11-15T13:45:00Z",
      updatedAt: "2023-11-30T11:10:00Z"
    }
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