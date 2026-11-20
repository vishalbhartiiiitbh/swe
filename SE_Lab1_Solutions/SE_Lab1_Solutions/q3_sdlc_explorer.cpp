#include <iostream>

using namespace std;

void displayModelDetails(int choice) {
    switch (choice) {
        case 1:
            cout << "\n=== 1. Waterfall Model ===\n";
            cout << "Key Features:\n"
                 << "  - Linear and sequential life cycle approach.\n"
                 << "  - Each phase must be completed before the next begins; minimal overlap.\n"
                 << "  - Heavy emphasis on upfront documentation and strict milestones.\n";
            cout << "Typical Phases:\n"
                 << "  1. Requirement Analysis & Specification\n"
                 << "  2. System Design\n"
                 << "  3. Implementation (Coding)\n"
                 << "  4. Integration & Testing\n"
                 << "  5. Deployment\n"
                 << "  6. Maintenance\n";
            cout << "Advantages:\n"
                 << "  - Simple, easy to understand, and straightforward to manage.\n"
                 << "  - Works well when requirements are stable, clear, and well-understood.\n";
            cout << "Disadvantages:\n"
                 << "  - Inflexible to changing requirements once development starts.\n"
                 << "  - Working software is not produced until late in the life cycle.\n";
            break;

        case 2:
            cout << "\n=== 2. Incremental Model ===\n";
            cout << "Key Features:\n"
                 << "  - System is broken down into smaller, functional builds (increments).\n"
                 << "  - Core functionality is delivered first, with features added in subsequent releases.\n";
            cout << "Typical Phases:\n"
                 << "  1. Requirement Specification\n"
                 << "  2. Architectural Design\n"
                 << "  3. Iterative Increment Cycles (Design -> Code -> Test -> Deliver)\n";
            cout << "Advantages:\n"
                 << "  - Generates working software quickly and early in the life cycle.\n"
                 << "  - Easier to test, debug, and accommodate requirement changes between increments.\n";
            cout << "Disadvantages:\n"
                 << "  - Requires clear upfront system architecture so increments integrate cleanly.\n"
                 << "  - Total cost can exceed Waterfall if scope creeps across iterations.\n";
            break;

        case 3:
            cout << "\n=== 3. Spiral Model ===\n";
            cout << "Key Features:\n"
                 << "  - Risk-driven evolutionary process combining iterative development with systematic control.\n"
                 << "  - Each loop (spiral) represents a phase of the software process.\n";
            cout << "Typical Phases (4 Quadrants per Spiral):\n"
                 << "  1. Objective Setting & Alternative Identification\n"
                 << "  2. Risk Assessment & Reduction (Prototyping)\n"
                 << "  3. Development & Validation\n"
                 << "  4. Review & Planning Next Iteration\n";
            cout << "Advantages:\n"
                 << "  - High amount of risk analysis makes it ideal for large, mission-critical projects.\n"
                 << "  - Software is produced early and evolves with continuous user feedback.\n";
            cout << "Disadvantages:\n"
                 << "  - Expensive to operate and requires specialized expertise in risk assessment.\n"
                 << "  - Not suitable for small, low-risk projects.\n";
            break;

        case 4:
            cout << "\n=== 4. Agile Model ===\n";
            cout << "Key Features:\n"
                 << "  - Iterative and incremental development organized into short time-boxed sprints (1-4 weeks).\n"
                 << "  - Prioritizes working software, customer collaboration, and responding to change.\n";
            cout << "Typical Phases:\n"
                 << "  1. Concept & Product Backlog Creation\n"
                 << "  2. Sprint Planning\n"
                 << "  3. Iterative Execution (Design, Code, Test, Daily Standups)\n"
                 << "  4. Sprint Review & Retrospective\n"
                 << "  5. Continuous Release & Maintenance\n";
            cout << "Advantages:\n"
                 << "  - Highly adaptable to changing requirements even late in development.\n"
                 << "  - Continuous delivery of business value and high customer satisfaction.\n";
            cout << "Disadvantages:\n"
                 << "  - Less predictable timelines and budgets if scope evolves continuously.\n"
                 << "  - Minimal formal documentation can complicate long-term maintenance or onboarding.\n";
            break;

        case 5:
            cout << "\n=== 5. Prototyping Model ===\n";
            cout << "Key Features:\n"
                 << "  - Builds an early working replica (prototype) of the system to clarify requirements.\n"
                 << "  - Focuses on user interface, workflows, and early client validation.\n";
            cout << "Typical Phases:\n"
                 << "  1. Quick Requirement Gathering\n"
                 << "  2. Quick Design\n"
                 << "  3. Build Prototype\n"
                 << "  4. User Evaluation & Feedback\n"
                 << "  5. Refine Prototype (Repeat until accepted)\n"
                 << "  6. Engineer Final Product\n";
            cout << "Advantages:\n"
                 << "  - Reduces ambiguity in requirements and detects missing functionality early.\n"
                 << "  - Active user involvement leads to better usability and acceptance.\n";
            cout << "Disadvantages:\n"
                 << "  - Users may mistake the quick prototype for the production-ready system.\n"
                 << "  - Developers may compromise code quality if throwaway prototypes are kept in production.\n";
            break;

        default:
            cout << "\nInvalid choice. Please select an option between 1 and 6.\n";
            break;
    }
}

int main() {
    int choice;

    while (true) {
        cout << "\n=============================================\n";
        cout << "   Software Development Model Explorer\n";
        cout << "=============================================\n";
        cout << "1. Waterfall Model\n";
        cout << "2. Incremental Model\n";
        cout << "3. Spiral Model\n";
        cout << "4. Agile Model\n";
        cout << "5. Prototyping Model\n";
        cout << "6. Exit\n";
        cout << "Select a model (1-6): ";

        if (!(cin >> choice)) {
            cin.clear();
            cin.ignore(10000, '\n');
            cout << "Invalid input. Please enter a number.\n";
            continue;
        }

        if (choice == 6) {
            cout << "Exiting Software Development Model Explorer. Goodbye!\n";
            break;
        }

        displayModelDetails(choice);
    }

    return 0;
}
