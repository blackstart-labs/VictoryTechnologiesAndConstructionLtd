using VDCBD.API.Configs;
using VDCBD.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace VDCBD.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var context = serviceProvider.GetRequiredService<AppDbContext>();

            // Ensure all existing users are set to Active (since the migration default might be false)
            var usersToActivate = await context.Users.Where(u => !u.IsActive).ToListAsync();
            if (usersToActivate.Any())
            {
                foreach (var u in usersToActivate)
                {
                    u.IsActive = true;
                }
                await context.SaveChangesAsync();
            }

            // ── Roles ─────────────────────────────────────────────────────────────
            string[] roles = { "Admin", "Student", "User" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // Ensure ai-chatbot-context CMS ContentBlock exists
            var chatbotBlock = await context.ContentBlocks.FirstOrDefaultAsync(b => b.Identifier == "ai-chatbot-context");
            if (chatbotBlock == null)
            {
                context.ContentBlocks.Add(new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    Identifier = "ai-chatbot-context",
                    Content = "Victory Design & Construction (VDCBD) is a leading architectural design and structural consultancy firm in Bangladesh.\n\nBranches:\n- Main Branch: Eastern Kamalapur Complex, 2nd Floor, Room No 206, Kamalapur, Dhaka 1000.\n- Branch Office: Madhya Bazar, Chandina, Cumilla.\n\nContacts:\n- Phone: +88 01779481486, +88 01868785980\n- Email: victorydesign72@gmail.com\n\nServices Offered:\n1. Architectural Design\n2. Structural Design\n3. Interior Design\n4. Construction Management\n5. Engineering Consultancy\n6. Project Supervision\n7. Estimation & Costing\n8. Renovation & Space Planning\n\nAcademy Courses:\n- Modern Interior Design Mastery (BDT 4,999) - Learn residential and commercial design, AutoCAD, 3ds Max, V-Ray, and site management.\n- Structural Engineering & Revit (BDT 5,999) - Revit workflows, ETABS analysis, and structural detailing.\n- Site Engineering and Supervision (BDT 3,500) - Field supervision, calculations, and safety rules.",
                    Type = "Text",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Ensure about-company-vision exists
            var visionBlock = await context.ContentBlocks.FirstOrDefaultAsync(b => b.Identifier == "about-company-vision");
            if (visionBlock == null)
            {
                context.ContentBlocks.Add(new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    Identifier = "about-company-vision",
                    Content = "To be the most trusted structural engineering, architectural planning, and interior designing firm in Bangladesh, delivering sustainable, state-of-the-art designs aligned with global standards.",
                    Type = "Text",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Ensure contact-office-address exists
            var contactBlock = await context.ContentBlocks.FirstOrDefaultAsync(b => b.Identifier == "contact-office-address");
            if (contactBlock == null)
            {
                context.ContentBlocks.Add(new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    Identifier = "contact-office-address",
                    Content = "Main Branch: Eastern Kamalapur Complex, 2nd Floor, Room No 206, Kamalapur, Dhaka 1000.\nCumilla Branch: Madhya Bazar, Chandina, Cumilla.",
                    Type = "Text",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Ensure academy-training-tagline exists
            var trainingBlock = await context.ContentBlocks.FirstOrDefaultAsync(b => b.Identifier == "academy-training-tagline");
            if (trainingBlock == null)
            {
                context.ContentBlocks.Add(new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    Identifier = "academy-training-tagline",
                    Content = "VDCBD Academy empowers next-generation engineers, architects, and designers with hands-on professional courses in Revit, interior design, and site supervision.",
                    Type = "Text",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            // Ensure home-hero-subtitle exists
            var heroBlock = await context.ContentBlocks.FirstOrDefaultAsync(b => b.Identifier == "home-hero-subtitle");
            if (heroBlock == null)
            {
                context.ContentBlocks.Add(new ContentBlock
                {
                    Id = Guid.NewGuid(),
                    Identifier = "home-hero-subtitle",
                    Content = "Professional structural, architectural, and interior solutions. Over 2,500+ trained professionals and 50+ completed architectural projects in Bangladesh.",
                    Type = "Text",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await context.SaveChangesAsync();

            // ── Admin User ────────────────────────────────────────────────────────
            const string adminEmail = "admin@vdcbd.com";
            if (await userManager.FindByEmailAsync(adminEmail) == null)
            {
                var admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "System Administrator",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };
                var r = await userManager.CreateAsync(admin, "Admin@123!");
                if (r.Succeeded) await userManager.AddToRoleAsync(admin, "Admin");
            }

            // ── Demo Student ──────────────────────────────────────────────────────
            const string studentEmail = "student@vdcbd.com";
            ApplicationUser? studentUser = null;
            if (await userManager.FindByEmailAsync(studentEmail) == null)
            {
                studentUser = new ApplicationUser
                {
                    UserName = studentEmail,
                    Email = studentEmail,
                    FullName = "Demo Student",
                    Role = "Student",
                    CreatedAt = DateTime.UtcNow
                };
                var r = await userManager.CreateAsync(studentUser, "Student@123!");
                if (r.Succeeded) await userManager.AddToRoleAsync(studentUser, "Student");
            }
            else
            {
                studentUser = await userManager.FindByEmailAsync(studentEmail);
            }

            // ── Skip rest if already seeded ───────────────────────────────────────
            if (await context.Courses.AnyAsync()) return;

            const string videoUrl = "https://res.cloudinary.com/dniosv5ot/video/upload/v1779370284/engineers_roeyve.mp4";

            // ── Trainings (Courses) ───────────────────────────────────────────────
            var course1Id = Guid.NewGuid();
            var course2Id = Guid.NewGuid();
            var course3Id = Guid.NewGuid();

            var courses = new List<Course>
            {
                new()
                {
                    Id = course1Id,
                    Title = "Modern Interior Design Mastery",
                    Description = "A comprehensive training covering all aspects of modern interior design — from space planning and color theory to furniture selection and lighting design. Ideal for aspiring designers and home renovation enthusiasts.",
                    Price = 4999,
                    VideoUrl = videoUrl,
                    InstructorName = "Sarah Mitchell",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-60)
                },
                new()
                {
                    Id = course2Id,
                    Title = "Structural Engineering Fundamentals",
                    Description = "Master the core principles of structural engineering — load calculations, material science, beam and column design, and foundation types. Designed for civil engineering students and construction professionals.",
                    Price = 5999,
                    VideoUrl = videoUrl,
                    InstructorName = "Dr. James Patel",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-45)
                },
                new()
                {
                    Id = course3Id,
                    Title = "AutoCAD for Construction Professionals",
                    Description = "From zero to production-ready 2D and 3D drawings. Learn AutoCAD tools, layers, blocks, annotation, and printing workflows tailored for construction and architectural projects.",
                    Price = 3499,
                    VideoUrl = videoUrl,
                    InstructorName = "Mark Johnson",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                }
            };

            context.Courses.AddRange(courses);

            // ── Training 1 Modules ──────────────────────────────────────────────────
            var m1 = Guid.NewGuid(); var m2 = Guid.NewGuid(); var m3 = Guid.NewGuid();
            // Training 2 modules
            var m4 = Guid.NewGuid(); var m5 = Guid.NewGuid();
            // Training 3 modules
            var m6 = Guid.NewGuid(); var m7 = Guid.NewGuid();

            var modules = new List<CourseModule>
            {
                // Training 1 — Interior Design
                new() { Id = m1, CourseId = course1Id, Title = "Design Principles & Color Theory", Description = "Understand the foundational principles that drive great interior design.", Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = m2, CourseId = course1Id, Title = "Space Planning & Furniture Layout", Description = "Learn how to plan spaces efficiently and choose the right furniture.", Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = m3, CourseId = course1Id, Title = "Lighting Design & Finishing", Description = "Master ambient, task, and accent lighting along with surface finishes.", Order = 3, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 2 — Structural Engineering
                new() { Id = m4, CourseId = course2Id, Title = "Introduction to Structural Systems", Description = "Overview of load paths and structural systems.", Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = m5, CourseId = course2Id, Title = "Beam & Column Design", Description = "Calculations and design principles for beams and columns.", Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 3 — AutoCAD
                new() { Id = m6, CourseId = course3Id, Title = "AutoCAD Interface & Setup", Description = "Navigate the AutoCAD workspace and configure it for construction work.", Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = m7, CourseId = course3Id, Title = "2D Drafting Essentials", Description = "Lines, circles, arcs, annotations, and dimensions.", Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
            };

            context.CourseModules.AddRange(modules);

            // ── Video Lessons ─────────────────────────────────────────────────────
            var l1 = Guid.NewGuid(); var l2 = Guid.NewGuid(); var l3 = Guid.NewGuid();
            var lessons = new List<VideoLesson>
            {
                // Training 1 — Module 1
                new() { Id = l1, ModuleId = m1, Title = "Welcome to Interior Design", VideoUrl = videoUrl, DurationInSeconds = 420, Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = l2, ModuleId = m1, Title = "Understanding the Color Wheel", VideoUrl = videoUrl, DurationInSeconds = 750, Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = l3, ModuleId = m1, Title = "Creating Mood Boards", VideoUrl = videoUrl, DurationInSeconds = 600, Order = 3, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 1 — Module 2
                new() { Id = Guid.NewGuid(), ModuleId = m2, Title = "Reading Floor Plans", VideoUrl = videoUrl, DurationInSeconds = 900, Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m2, Title = "Furniture Placement Rules", VideoUrl = videoUrl, DurationInSeconds = 660, Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 1 — Module 3
                new() { Id = Guid.NewGuid(), ModuleId = m3, Title = "Types of Lighting in Design", VideoUrl = videoUrl, DurationInSeconds = 540, Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m3, Title = "Choosing Finishes & Textures", VideoUrl = videoUrl, DurationInSeconds = 480, Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 2 — Module 4
                new() { Id = Guid.NewGuid(), ModuleId = m4, Title = "Load Path Fundamentals", VideoUrl = videoUrl, DurationInSeconds = 780, Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m4, Title = "Types of Structural Systems", VideoUrl = videoUrl, DurationInSeconds = 840, Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 2 — Module 5
                new() { Id = Guid.NewGuid(), ModuleId = m5, Title = "Beam Design Calculations", VideoUrl = videoUrl, DurationInSeconds = 960, Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m5, Title = "Column Load Analysis", VideoUrl = videoUrl, DurationInSeconds = 720, Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 3 — Module 6
                new() { Id = Guid.NewGuid(), ModuleId = m6, Title = "AutoCAD Workspace Tour", VideoUrl = videoUrl, DurationInSeconds = 600, Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m6, Title = "Setting Up Drawing Units", VideoUrl = videoUrl, DurationInSeconds = 450, Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
                // Training 3 — Module 7
                new() { Id = Guid.NewGuid(), ModuleId = m7, Title = "Drawing Lines & Polylines", VideoUrl = videoUrl, DurationInSeconds = 660, Order = 1, IsPublished = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m7, Title = "Dimensions & Annotations", VideoUrl = videoUrl, DurationInSeconds = 540, Order = 2, IsPublished = true, CreatedAt = DateTime.UtcNow },
            };

            context.VideoLessons.AddRange(lessons);

            // ── Resource Links ────────────────────────────────────────────────────
            context.ResourceLinks.AddRange(new List<ResourceLink>
            {
                new() { Id = Guid.NewGuid(), ModuleId = m1, Title = "Color Theory Cheat Sheet", Url = "https://www.canva.com/colors/color-wheel/", Type = "Link", CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m1, Title = "Module 1 Slide Deck (PDF)", Url = "https://example.com/slides/module1.pdf", Type = "PDF", CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), ModuleId = m2, Title = "Space Planning Worksheet", Url = "https://example.com/worksheets/space.pdf", Type = "PDF", CreatedAt = DateTime.UtcNow },
            });

            // ── Projects (Design + Construction) ──────────────────────────────────
            context.Projects.AddRange(new List<Project>
            {
                // Design Projects
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Heritage Hotel Interior Renovation",
                    Description = "Full interior redesign of a 5-star heritage hotel — 200 guest rooms, 3 restaurants, and the grand ballroom. Blended colonial-era architecture with contemporary comfort and smart room technology.",
                    ImageUrl = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
                    Category = "Design",
                    ClientName = "Grand Heritage Hotels Group",
                    Location = "Old Dhaka, Dhaka",
                    CompletionDate = DateTime.UtcNow.AddMonths(-9),
                    Status = "Completed",
                    VideoUrl = videoUrl,
                    ClientReview = "VDCBD exceeded our expectations. The blend of heritage aesthetics with modern amenities was masterfully executed.",
                    ClientReviewerName = "Kamal Hossain, CEO",
                    SecondaryImages = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800,https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddYears(-1).AddMonths(-3)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Modern Living Space — Baridhara Diplomatic Zone",
                    Description = "Complete interior transformation of a 3500 sq ft luxury apartment. Minimalist Scandinavian design, custom joinery, automated blinds, and premium Italian marble finishing throughout.",
                    ImageUrl = "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800",
                    Category = "Design",
                    ClientName = "Private Client",
                    Location = "Baridhara, Dhaka",
                    CompletionDate = DateTime.UtcNow.AddMonths(-2),
                    Status = "Completed",
                    ClientReview = "We are thrilled with how our home turned out. Every detail was perfect.",
                    ClientReviewerName = "Fatima Rahman",
                    SecondaryImages = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-8)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Corporate Office Interior — Banani Commercial Hub",
                    Description = "4,000 sq ft open-plan corporate office design with ergonomic workstations, glass conference rooms, breakout zones, and an executive lounge. Focused on employee well-being and productivity.",
                    ImageUrl = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
                    Category = "Design",
                    ClientName = "TechBridge Solutions Ltd.",
                    Location = "Banani, Dhaka",
                    Status = "Ongoing",
                    ClientReview = null,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3)
                },
                // Construction Projects
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Skyline Corporate Tower",
                    Description = "A 22-story mixed-use skyscraper in Dhaka's commercial district featuring earthquake-resistant structural systems, green-certified mechanical systems, and a distinctive glass curtain wall facade.",
                    ImageUrl = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800",
                    Category = "Construction",
                    ClientName = "Skyline Holdings Ltd.",
                    Location = "Gulshan, Dhaka",
                    CompletionDate = DateTime.UtcNow.AddMonths(-6),
                    Status = "Completed",
                    VideoUrl = videoUrl,
                    ClientReview = "The structural execution was world-class. Delivered on time with zero compromise on safety standards.",
                    ClientReviewerName = "Rezaul Karim, Director",
                    SecondaryImages = "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800,https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddYears(-1)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "The Riverside Luxury Residences",
                    Description = "A 120-unit premium residential complex along the Buriganga riverbank. Features bespoke interior packages, rooftop gardens, and a state-of-the-art community center.",
                    ImageUrl = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
                    Category = "Construction",
                    ClientName = "Riverside Developers",
                    Location = "Keraniganj, Dhaka",
                    CompletionDate = DateTime.UtcNow.AddMonths(-3),
                    Status = "Completed",
                    ClientReview = "A landmark project for our company. The quality of construction was outstanding.",
                    ClientReviewerName = "Nahid Sultana, Managing Director",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-18)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Green Industrial Warehouse Complex",
                    Description = "A 40,000 sq ft industrial logistics hub built with solar panels, rainwater harvesting, and efficient spatial zoning to reduce energy consumption by 35%.",
                    ImageUrl = "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800",
                    Category = "Construction",
                    ClientName = "EcoLogix Bangladesh",
                    Location = "Gazipur Industrial Zone",
                    Status = "Ongoing",
                    VideoUrl = videoUrl,
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6)
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    Title = "Chittagong Highway Overpass Bridge",
                    Description = "Major infrastructure project — a 2.4km elevated highway overpass designed to ease traffic congestion at the city's primary commercial corridor. Reinforced concrete pier design with seismic resilience.",
                    ImageUrl = "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=800",
                    Category = "Construction",
                    ClientName = "Bangladesh Highways Authority",
                    Location = "Chittagong",
                    Status = "Upcoming",
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1)
                },
            });

            // ── CMS Content Blocks ────────────────────────────────────────────────
            context.ContentBlocks.AddRange(new List<ContentBlock>
            {
                new() { Id = Guid.NewGuid(), Identifier = "home-hero-title", Content = "Building Excellence, Engineering Trust", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "home-hero-subtitle", Content = "Professional training, design & construction services — delivering projects with integrity across Bangladesh.", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "home-hero-cta", Content = "Browse Trainings", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "about-us-text", Content = "VDCBD is Bangladesh's premier training and construction platform for design and engineering professionals. Founded in 2020, we have trained over 2,000 students and delivered more than 50 landmark projects across the country.", Type = "Html", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "footer-tagline", Content = "Build Knowledge. Build Futures.", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "contact-email", Content = "contact@vdcbd.com", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "contact-phone", Content = "+880 1700-000000", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "contact-address", Content = "House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "stats-students", Content = "2500+", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "stats-courses", Content = "15+", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "stats-projects", Content = "50+", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "stats-instructors", Content = "10+", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Id = Guid.NewGuid(), Identifier = "ai-chatbot-context", Content = "Victory Design & Construction (VDCBD) is a leading architectural design and structural consultancy firm in Bangladesh.\n\nBranches:\n- Main Branch: Eastern Kamalapur Complex, 2nd Floor, Room No 206, Kamalapur, Dhaka 1000.\n- Branch Office: Madhya Bazar, Chandina, Cumilla.\n\nContacts:\n- Phone: +88 01779481486, +88 01868785980\n- Email: victorydesign72@gmail.com\n\nServices Offered:\n1. Architectural Design\n2. Structural Design\n3. Interior Design\n4. Construction Management\n5. Engineering Consultancy\n6. Project Supervision\n7. Estimation & Costing\n8. Renovation & Space Planning\n\nAcademy Courses:\n- Modern Interior Design Mastery (BDT 4,999) - Learn residential and commercial design, AutoCAD, 3ds Max, V-Ray, and site management.\n- Structural Engineering & Revit (BDT 5,999) - Revit workflows, ETABS analysis, and structural detailing.\n- Site Engineering and Supervision (BDT 3,500) - Field supervision, calculations, and safety rules.", Type = "Text", IsActive = true, CreatedAt = DateTime.UtcNow },
            });

            await context.SaveChangesAsync();

            // ── Enrollment & Progress for Demo Student ────────────────────────────
            if (studentUser != null)
            {
                var alreadyEnrolled = await context.Enrollments
                    .AnyAsync(e => e.UserId == studentUser.Id && e.CourseId == course1Id);

                if (!alreadyEnrolled)
                {
                    context.Enrollments.Add(new Enrollment
                    {
                        Id = Guid.NewGuid(),
                        UserId = studentUser.Id,
                        CourseId = course1Id,
                        EnrolledAt = DateTime.UtcNow.AddDays(-20),
                        IsActive = true
                    });

                    context.Payments.Add(new PaymentRecord
                    {
                        Id = Guid.NewGuid(),
                        UserId = studentUser.Id,
                        CourseId = course1Id,
                        Amount = 4999,
                        Status = "Success",
                        TransactionId = "SEED_BKH001",
                        PaymentMethod = "bKash",
                        PhoneNumber = "01712345678",
                        CreatedAt = DateTime.UtcNow.AddDays(-20)
                    });

                    // Mark first 2 lessons as complete for demo progress
                    context.LessonProgresses.AddRange(new[]
                    {
                        new LessonProgress { Id = Guid.NewGuid(), UserId = studentUser.Id, LessonId = l1, IsCompleted = true, CompletedAt = DateTime.UtcNow.AddDays(-18), CreatedAt = DateTime.UtcNow.AddDays(-18) },
                        new LessonProgress { Id = Guid.NewGuid(), UserId = studentUser.Id, LessonId = l2, IsCompleted = true, CompletedAt = DateTime.UtcNow.AddDays(-17), CreatedAt = DateTime.UtcNow.AddDays(-17) },
                    });

                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
