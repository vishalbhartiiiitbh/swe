#include <iostream>
#include <cmath>
#include <iomanip>

using namespace std;

int main() {
    double kloc;
    int mode;

    cout << "=== Basic COCOMO Effort Estimation ===\n";
    cout << "Enter estimated software size (in KLOC): ";
    if (!(cin >> kloc) || kloc <= 0) {
        cout << "Invalid KLOC value. Must be greater than 0.\n";
        return 1;
    }

    cout << "\nSelect Project Mode:\n";
    cout << "1. Organic\n";
    cout << "2. Semi-Detached\n";
    cout << "3. Embedded\n";
    cout << "Enter choice (1-3): ";
    cin >> mode;

    double a = 0.0, b = 0.0, c = 0.0, d = 0.0;
    string modeName;

    switch (mode) {
        case 1:
            modeName = "Organic";
            a = 2.4; b = 1.05; c = 2.5; d = 0.38;
            break;
        case 2:
            modeName = "Semi-Detached";
            a = 3.0; b = 1.12; c = 2.5; d = 0.35;
            break;
        case 3:
            modeName = "Embedded";
            a = 3.6; b = 1.20; c = 2.5; d = 0.32;
            break;
        default:
            cout << "Invalid mode selected.\n";
            return 1;
    }

    double effort = a * pow(kloc, b);
    double devTime = c * pow(effort, d);
    double avgStaff = effort / devTime;

    cout << fixed << setprecision(2);
    cout << "\n--- COCOMO Estimation (" << modeName << " Mode) ---\n";
    cout << "Estimated Effort   : " << effort << " Person-Months\n";
    cout << "Development Time   : " << devTime << " Months\n";
    cout << "Average Staff Size : " << avgStaff << " Persons\n";

    return 0;
}
