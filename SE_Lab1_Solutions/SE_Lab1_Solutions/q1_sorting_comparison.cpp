#include <iostream>
#include <vector>
#include <utility>

using namespace std;

struct SortStats {
    long long comparisons = 0;
    long long swaps = 0;
};

SortStats bubbleSort(vector<int>& arr) {
    SortStats stats;
    int n = static_cast<int>(arr.size());
    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; ++j) {
            stats.comparisons++;
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                stats.swaps++;
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return stats;
}

SortStats selectionSort(vector<int>& arr) {
    SortStats stats;
    int n = static_cast<int>(arr.size());
    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;
        for (int j = i + 1; j < n; ++j) {
            stats.comparisons++;
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            swap(arr[i], arr[minIdx]);
            stats.swaps++;
        }
    }
    return stats;
}

void printArray(const vector<int>& arr) {
    for (size_t i = 0; i < arr.size(); ++i) {
        cout << arr[i] << (i + 1 < arr.size() ? " " : "");
    }
    cout << "\n";
}

int main() {
    int n;
    cout << "Enter the number of elements: ";
    if (!(cin >> n) || n <= 0) {
        cout << "Invalid array size.\n";
        return 1;
    }

    vector<int> original(n);
    cout << "Enter " << n << " integers: ";
    for (int i = 0; i < n; ++i) {
        cin >> original[i];
    }

    vector<int> arrBubble = original;
    vector<int> arrSelection = original;

    SortStats bubbleStats = bubbleSort(arrBubble);
    SortStats selectionStats = selectionSort(arrSelection);

    cout << "\n--- Bubble Sort Results ---\n";
    cout << "Sorted Array : ";
    printArray(arrBubble);
    cout << "Comparisons  : " << bubbleStats.comparisons << "\n";
    cout << "Swaps        : " << bubbleStats.swaps << "\n";

    cout << "\n--- Selection Sort Results ---\n";
    cout << "Sorted Array : ";
    printArray(arrSelection);
    cout << "Comparisons  : " << selectionStats.comparisons << "\n";
    cout << "Swaps        : " << selectionStats.swaps << "\n";

    return 0;
}
