package com.negadras.summarizer.util;

import java.util.Arrays;

public final class TextUtils {

    private TextUtils() {}

    public static int countWords(String text) {
        if (text == null || text.isEmpty()) {
            return 0;
        }

        return (int) Arrays.stream(text.split("\\s+"))
                .filter(word -> !word.isEmpty())
                .count();
    }
}
